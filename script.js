// region defs

let rollLog = []

function logRoll(res) { rollLog.push(res) }

function d10() {
    let result = Math.floor(Math.random() * 10) + 1
    logRoll(' ' + result)
    return result
}

function d5() {
    let result = Math.ceil(d10() / 2)
    logRoll('/2=' + result)
    return result
}

function d100() {
    let tens = d10()
    let ones = d10()
    let res = (tens == 10 ? 0 : tens) * 10 + (ones == 10 ? 0 : ones)
    logRoll('=' + res)
    if (res == 0) return 100; else return res;
}

function Stats(
    cqc = 0,
    rc = 0,
    str = 0,
    con = 0,
    dex = 0,
    int = 0,
    per = 0,
    wil = 0,
    cha = 0,
) {
    this.cqc = cqc
    this.rc  = rc
    this.str = str
    this.con = con
    this.dex = dex
    this.int = int
    this.per = per
    this.wil = wil
    this.cha = cha
    this.copy = function (mod = {}) {
        let cp = new Stats(cqc, rc, str, con, dex, int, per, wil, cha)
        Object.keys(mod).forEach(k => {
            if (Object.hasOwn(cp, k)) {
                cp[k] = cp[k] + mod[k]
            }
        })
        return cp
    }
}

function idf(x) {
    return x
}

function compose(f, g) {
    return function (x) {
        return g(f(x))
    }
}

function SecondaryMods(
    wounds = idf,
    corrupt = idf,
    madness = idf,
    fate = idf,
) {
    this.wounds = wounds
    this.corrupt = corrupt
    this.madness = madness
    this.fate = fate
}

function Skill(
    name,
    statId,
    description = "",
) {
    this.name = name
    this.statId = statId
    this.description = description
}

function subSkill(skill, specName, specDescr) {
    return new Skill(
        skill.name + ' (' + specName + ')',
        skill.statId,
        skill.description + '\n' + specDescr,
    )
}

function Requirement(
    stats = new Stats(),
    talents = [],
) {
    this.stats = stats
    this.talents = talents
}

function Talent(
    name,
    description = "",
    requirements = [],
) {
    this.name = name
    this.description = description
    this.requirements = requirements
}

let sud = {
    fast: [100, 250, 500, 750],
    med: [250, 500, 750, 1000],
    hard: [500, 750, 1000, 2500],
    main: [100, 250, 500, 500],
    no: [+Infinity, +Infinity, +Infinity, +Infinity],
}

function StatUpgrades(
    cqc,
    rc,
    str,
    con,
    dex,
    int,
    per,
    wil,
    cha,
) {
    this.cqc = cqc
    this.rc = rc
    this.str = str
    this.con = con
    this.dex = dex
    this.int = int
    this.per = per
    this.wil = wil
    this.cha = cha
}

function Prof(
    name,
    statUpgrades,
    skills = [],
    talents = [],
) {
    this.name = name
    this.statUpgrades = statUpgrades
    this.skills = skills
    this.talents = talents
}

function Origin(
    name,
    stats,
    profs,
    skills = [],
    talents = [],
    secondaryMods = new SecondaryMods(),
    baseWounds,
    fateChances,
    constitutions,
    ages,
    appearences,
    marks,
    specialTrait = [ new RollableOption('', 1, 100) ],
) {
    this.name = name
    this.stats = stats
    this.profs = profs
    this.skills = skills
    this.talents = talents
    this.secondaryMods = secondaryMods
    this.baseWounds = baseWounds
    this.fateChances = fateChances
    this.constitutions = constitutions
    this.ages = ages
    this.appearences = appearences
    this.marks = marks
    this.specialTrait = specialTrait
}

function RollableOption(
    id,
    low,
    high,
) {
    this.id = id
    this.low = low
    this.high = high
}

function rollOption(options, d = d100) {
    let res = d()
    for (let o of options) {
        if (o.low <= res && res <= o.high) return o.id
    }
    throw "Rolled " + res + ", but there is no suitable option in " + options
}

function Constitution(
    description,
    height,
    weight,
) {
    this.description = description
    this.height = height
    this.weight = weight
}

function mkConstVariants(
    d1m, h1m, w1m, d1f, h1f, w1f,
    d2m, h2m, w2m, d2f, h2f, w2f,
    d3m, h3m, w3m, d3f, h3f, w3f,
    d4m, h4m, w4m, d4f, h4f, w4f,
    d5m, h5m, w5m, d5f, h5f, w5f,
) {
    return [
        new RollableOption({ male: new Constitution(d1m, h1m, w1m), female: new Constitution(d1f, h1f, w1f) }, 1, 20),
        new RollableOption({ male: new Constitution(d2m, h2m, w2m), female: new Constitution(d2f, h2f, w2f) }, 21, 50),
        new RollableOption({ male: new Constitution(d3m, h3m, w3m), female: new Constitution(d3f, h3f, w3f) }, 51, 80),
        new RollableOption({ male: new Constitution(d4m, h4m, w4m), female: new Constitution(d4f, h4f, w4f) }, 81, 90),
        new RollableOption({ male: new Constitution(d5m, h5m, w5m), female: new Constitution(d5f, h5f, w5f) }, 91, 100),
    ]
}

function Age(description, base) {
    this.description = description
    this.base = base
    this.roll = function () {
        return this.base + d10()
    }
}

function Appearence(
    skin,
    hair,
    eyes,
) {
    this.skin = skin
    this.hair = hair
    this.eyes = eyes
}

function mkAppearences(
    s1, h1, e1,
    s2, h2, e2,
    s3, h3, e3,
    s4, h4, e4,
    s5, h5, e5,
) {
    return [
        new RollableOption(new Appearence(s1, h1, e1), 1, 30),
        new RollableOption(new Appearence(s2, h2, e2), 1, 50),
        new RollableOption(new Appearence(s3, h3, e3), 51, 70),
        new RollableOption(new Appearence(s4, h4, e4), 71, 90),
        new RollableOption(new Appearence(s5, h5, e5), 91, 100),
    ]
}

function mkMarks(
    q,w,e,r,t,y,u,i,o,p,a,s,d,f,g,h
) {
    return [
        new RollableOption(q, 1, 6),
        new RollableOption(w, 7, 13),
        new RollableOption(e, 14, 20),
        new RollableOption(r, 21, 27),
        new RollableOption(t, 28, 34),
        new RollableOption(y, 35, 41),
        new RollableOption(u, 42, 48),
        new RollableOption(i, 49, 55),
        new RollableOption(o, 56, 61),
        new RollableOption(p, 62, 68),
        new RollableOption(a, 69, 75),
        new RollableOption(s, 76, 82),
        new RollableOption(d, 83, 87),
        new RollableOption(f, 88, 88),
        new RollableOption(g, 89, 95),
        new RollableOption(h, 96, 100),
    ]
}

let statNames = {
    cqc: "ББ",
    rc: "Б",
    str: "Сил",
    con: "Вын",
    dex: "Лов",
    int: "Инт",
    per: "Вос",
    wil: 'СВ',
    cha: 'Тов',
}

// endregion

// region rules

let nameTable = function () {
    let sample = [
        new RollableOption('', 1, 3),
        new RollableOption('', 4, 6),
        new RollableOption('', 7, 9),
        new RollableOption('', 10, 13),
        new RollableOption('', 14, 16),
        new RollableOption('', 17, 20),
        new RollableOption('', 21, 23),
        new RollableOption('', 24, 27),
        new RollableOption('', 28, 30),
        new RollableOption('', 31, 33),
        new RollableOption('', 34, 37),
        new RollableOption('', 38, 40),
        new RollableOption('', 41, 44),
        new RollableOption('', 45, 47),
        new RollableOption('', 48, 50),
        new RollableOption('', 51, 54),
        new RollableOption('', 55, 57),
        new RollableOption('', 58, 60),
        new RollableOption('', 61, 63),
        new RollableOption('', 64, 66),
        new RollableOption('', 67, 69),
        new RollableOption('', 70, 72),
        new RollableOption('', 73, 75),
        new RollableOption('', 76, 79),
        new RollableOption('', 80, 82),
        new RollableOption('', 83, 85),
        new RollableOption('', 86, 89),
        new RollableOption('', 90, 93),
        new RollableOption('', 94, 96),
        new RollableOption('', 97, 100),
    ]
    function mkTable(names) {
        return names.map((n, i) => new RollableOption(n, sample[i].low, sample[i].high))
    }
    return {
        male: [
            new RollableOption( // Примитивные
                mkTable([
                    'Арл',
                    'Бруул',
                    'Дар',
                    'Фрак',
                    'Фрал',
                    'Гарм',
                    'Грыш',
                    'Грак',
                    'Хак',
                    'Джарр',
                    'Кар',
                    'Каарл',
                    'Крелл',
                    'Лек',
                    'Мар',
                    'Мир',
                    'Нарл',
                    'Орл',
                    'Френц',
                    'Кварл',
                    'Рот',
                    'Рага',
                    'Стиг',
                    'Стрэнг',
                    'Так',
                    'Ульт',
                    'Варн',
                    'Вракс',
                    'Ярн',
                    'Зэк',
                ]),
                1,
                1,
            ),
            new RollableOption( // Низкие
                mkTable([
                    'Барак',
                    'Каин',
                    'Дариэль',
                    'Илай',
                    'Енох',
                    'Фраст',
                    'Гай',
                    'Гарвель',
                    'Гаст',
                    'Игнат',
                    'Ишмаэль',
                    'Иерихон',
                    'Клайт',
                    'Лазарь',
                    'Мордехай',
                    'Митра',
                    'Никодим',
                    'Понтий',
                    'Квинт',
                    'Рабалий',
                    'Ристий',
                    'Сильван',
                    'Соломон',
                    'Таддий',
                    'Тит',
                    'Уриан',
                    'Варний',
                    'Ксеркс',
                    'Зэддион',
                    'Зариэль',
                ]),
                2,
                2,
            ),
            new RollableOption( // Высокие
                mkTable([
                    'Ателлус',
                    'Брутус',
                    'Каллидон',
                    'Кастус',
                    'Друстос',
                    'Флавион',
                    'Галлус',
                    'Гакстес',
                    'Интиос',
                    'Джастилус',
                    'Кальтос',
                    'Лицилус',
                    'Люпус',
                    'Маллеар',
                    'Металус',
                    'Нигилиус',
                    'Новус',
                    'Октус',
                    'Претус',
                    'Квинтос',
                    'Ральтус',
                    'Рэвион',
                    'Регис',
                    'Северус',
                    'Силон',
                    'Таурон',
                    'Трэнтор',
                    'Венрис',
                    'Виктус',
                    'Ксантис',
                ]),
                3,
                3,
            ),
            new RollableOption( // Архаичные
                mkTable([
                    'Аларих',
                    'Аттила',
                    'Барбоса',
                    'Кортез',
                    'Константин',
                    'Кромвель',
                    'Дорн',
                    'Дрейк',
                    'Айзен',
                    'Феррус',
                    'Грендель',
                    'Жиллиман',
                    'Хэвлок',
                    'Иактон',
                    'Джагатай',
                    'Хан',
                    'Леман',
                    'Лев',
                    'Магнус',
                    'Меркуцио',
                    'Никсиос',
                    'Рамирес',
                    'Сергар',
                    'Сигизмунд',
                    'Тибальд',
                    'Верн',
                    'Вольф',
                    'Уолси',
                    'Зэйн',
                    'Жарков',
                ]),
                4,
                4,
            ),
            new RollableOption( // Кликухи
                mkTable([
                    'Эйбл',
                    'Боунс',
                    'Кризис',
                    'Каттер',
                    'Декко',
                    'Дакка',
                    'Фраг',
                    'Флэйр',
                    'Финиаль',
                    'Грим',
                    'Гоб',
                    'Ганнер',
                    'Хакер',
                    'Джейкс',
                    'Крак',
                    'Лаг',
                    'Монгрель',
                    'Плекс',
                    'Рэт',
                    'Рэд',
                    'Соуни',
                    'Скэб',
                    'Скэммер',
                    'Скайв',
                    'Шенк',
                    'Шив',
                    'Шэм',
                    'Штерн',
                    'Стаббер',
                    'Вербал',
                ]),
                5,
                5,
            ),
        ],
        female: [
            new RollableOption( // Примитивные
                mkTable([
                    'Арла',
                    'Брулла',
                    'Дарл',
                    'Фрака',
                    'Фраал',
                    'Гарма',
                    'Грыша',
                    'Граки',
                    'Хака',
                    'Джарра',
                    'Карна',
                    'Каарли',
                    'Крелла',
                    'Лекка',
                    'Марла',
                    'Мира',
                    'Нарла',
                    'Орла',
                    'Фрикс',
                    'Квали',
                    'Рота',
                    'Рагана',
                    'Стигга',
                    'Стрэнга',
                    'Такка',
                    'Ульта',
                    'Варна',
                    'Вракса',
                    'Ярни',
                    'Зэкка',
                ]),
                1,
                1,
            ),
            new RollableOption( // Низкие
                mkTable([
                    'Акадия',
                    'Хальдия',
                    'Сайрин',
                    'Диона',
                    'Деатрис',
                    'Эфина',
                    'Эфраэль',
                    'Фенрия',
                    'Гайя',
                    'Галатея',
                    'Хазаэль',
                    'Иша',
                    'Ишта',
                    'Джедия',
                    'Юдикка',
                    'Лира',
                    'Магдалина',
                    'Нарция',
                    'Офелия',
                    'Фебия',
                    'Квалия',
                    'Риа',
                    'Саломея',
                    'Солария',
                    'Тиратия',
                    'Феба',
                    'Уриэль',
                    'Вейда',
                    'Ксантиппа',
                    'Зиапатра',
                ]),
                2,
                2,
            ),
            new RollableOption( // Высокие
                mkTable([
                    'Ателла',
                    'Брутилла',
                    'Каллидия',
                    'Кастилла',
                    'Друстилла',
                    'Флавия',
                    'Галлия',
                    'Гакста',
                    'Интиас',
                    'Джастилла',
                    'Кальта',
                    'Лицилла',
                    'Лупа',
                    'Маллия',
                    'Мета',
                    'Нигилла',
                    'Новиа',
                    'Октия',
                    'Претия',
                    'Квинтилла',
                    'Ральтия',
                    'Рэвия',
                    'Регия',
                    'Северина',
                    'Сила',
                    'Таура',
                    'Трэнтия',
                    'Венрия',
                    'Виктия',
                    'Ксантия',
                ]),
                3,
                3,
            ),
            new RollableOption( // Архаичные
                mkTable([
                    'Энид',
                    'Альбия',
                    'Борджиа',
                    'Кимбрия',
                    'Деви',
                    'Эфес',
                    'Эфрати',
                    'Инес',
                    'Императрис',
                    'Джемдар',
                    'Джезаиль',
                    'Джосс',
                    'Кадис',
                    'Кали',
                    'Лета',
                    'Маэ',
                    'Милисента',
                    'Мерика',
                    'Мидкифф',
                    'Мегера',
                    'Одесса',
                    'Орлеан',
                    'Плато',
                    'Скифия',
                    'Фиопия',
                    'Трэйс',
                    'Царина',
                    'Венера',
                    'Вальпурга',
                    'Жеткин',
                ]),
                4,
                4,
            ),
            new RollableOption( // Кликухи
                mkTable([
                    'Альфа',
                    'Блэйз',
                    'Блю',
                    'Кэт',
                    'Каламити',
                    'Дама',
                    'Дайс',
                    'Флэйр',
                    'Голд',
                    'Ганнер',
                    'Хак',
                    'Гало',
                    'Леди',
                    'Лак',
                    'Модести',
                    'Молл',
                    'Пистоль',
                    'Плекс',
                    'Прис',
                    'Рэт',
                    'Рэд',
                    'Руби',
                    'Скарлет',
                    'Спайк',
                    'Стил',
                    'Старр',
                    'Травма',
                    'Трик',
                    'Трикси',
                    'Зи',
                ]),
                5,
                5,
            ),
        ],
    }
}()

/* Тут перечисляются все способности
 * Шаблон примерно такой
 *
 *     <skillname>: new Skill('<Название>', '<код характеристики>', '<Описание>'),
 * 
 * <код характеристики> смотри выше
 * <skillname> пригодится ниже, набор латинских букв без пробелов
 * Не забудь запятую в конце!
 */

let skills = function () {
    let navigation_land = new Skill("Навигация (наземная)", 'int')

    let awareness = new Skill(
        "Блидтельность", 
        'per',
        "Бдительность – это способность предупреждать скрытые опасности и замечать мелкие детали окружающего тебя физического пространства. Она позволяет вовремя замечать засады, ловушки и иные вещи, представляющие опасность для тебя и твоих соратников. Бдительность не привязана к какому-то конкретному чувству – она объединяет их все."
    )
    let barter = new Skill(
        "Бартер",
        'cha',
        "Ты можешь использовать Бартер для того, чтобы добиваться более выгодных цен на товары и услуги.",
    )
    let blather = new Skill(
        'Трёп',
        'cha',
        'Предпринимая Тест на Трёп, ты извергаешь из себя настоящий поток слов (вполне вероятно, бессмысленной чепухи), пытаясь ошеломить, отвлечь, ввергнуть в ступор – иными словами, заболтать слушателя.',
    )
    let carouse = new Skill(
        'Стойкость',
        'con',
        'Идёт ли речь о лучшем амасеке, или о мерзком трущобном пойле, Стойкость нужна для того, чтобы сопротивляться воздействию алкоголя и наркотиков. Опытные «потребители» таких субстанций способны выработать определённого рода устойчивость к дурману, и сохранять ясную голову, когда все вокруг уже пали жертвами излишеств. Используй это умение, когда нужно сопротивляться эффектам алкоголя или иных подобных интоксикантов.',
    )
    let charm = new Skill(
        'Обольщение',
        'cha',
        'Обольщение используется для того, чтобы заводить друзей. Тест на Обольщение необходим, когда ты пытаешься убедить отдельных личностей или целую группу личностей пересмотреть свое мнение, умоляешь кого-нибудь или пытаешься соблазнить.'
    )
    let chemuse = new Skill(
        'Химия (юз)',
        'int',
        'Это умение необходимо для того, чтобы правильно обращаться с различными химикатами – в особенности с ядами и наркотиками.'
    )
    let ciphers = new Skill(
        'Шифры',
        'int',
        'Это Умение отражает понимание стенографических кодов, применяемых определёнными группами лиц для передачи основных идей, предупреждений и важной информации, имеющей отношение к сфере их деятельности.',
    )
    let ciphers_acolyte = subSkill(ciphers, 'Аколиты', 'Используется для общения между членами одной ячейки Аколитов при помощи особого, заранее условленного набора знаков и сигналов.')
    let ciphers_battle = subSkill(ciphers, 'Военный арго', 'Используется военными подразделениями для передачи приказов и донесения оперативных тактических сведений при помощи жестов, кодовых фраз или музыкальных сигналов.')
    let ciphers_secret_society = subSkill(ciphers, 'Тайное общество', 'Используются членами тайных обществ и культов для идентификации себе подобных и передачи простых сообщений.')
    let ciphers_occult = subSkill(ciphers, 'Оккультные', 'Мистические жесты, используемые для концентрации разума во время ритуалов, идентификации собратьев по знанию, а также для того, чтобы умиротворять или бичевать Демонов.')
    let ciphers_criminal = subSkill(ciphers, 'Преступный мир', 'Изощренная система жестов, стилей одежды, знаков, татуировок и прочей подобной мишуры, используемой криминальными сообществами для обмена ключевой информацией.')
    let climb = new Skill(
        'Лазание',
        'str',
        'В данном случае имеются в виду стены без специальных упоров для рук и ног, карнизы, отвесные скалы и т.п.',
    )
    let command = new Skill(
        'Командование',
        'cha',
        'Командование – это умение заставлять людей выполнять твои приказы. Действие этого умения распространяется только на тех, кто, так или иначе, находится в твоём подчинении.',
    )
    let concealment = new Skill(
        'Скрытность',
        'dex',
        'Для использования этого Умения совершенно необходимо наличие подходящих элементов обстановки (деревьев, стен, здания и т.п.), или иных маскирующих условий типа тумана или темноты.',
    )
    let contortionist = new Skill(
        'Побег',
        'dex',
        'Умение Побег применяется для того, чтобы выбираться из оков, проскальзывать в узкие лазы и изникать из пут и цепей.',
    )
    let deceive = new Skill(
        'Обман',
        'cha',
        'Это умение позволяет обманывать и дурачить других. Тест на Обман нужен в том случае, если ты хочешь убедить других в чем-то, что совсем не обязательноявляется правдой, обвести вокруг пальца, обдурить или направить по ложному пути.',
    )
    let disguise = new Skill(
        'Маскировка',
        'cha',
        'Маскировка – это умение скрыть свой истинный облик. Подходящая одежда, реквизит, макияж и косметические протезы – вот ключ к успешной маскировке, не исключающей, впрочем, и более радикальных подходов – пластической хирургии, бионической имплантации или инъекций полиморфина.',
    )
    let dodge = new Skill(
        "Уклонение",
        'dex',
        'Ты можешь использовать Уклонение один раз за Раунд, чтобы проигнорировать успешную рукопашную или дистанционную атаку. Если Тест успешен, атака не наносит Урона.'
    )
    let evaluate = new Skill(
        'Оценка',
        'int',
        'Ты можешь использовать этот навык, чтобы прикинуть примерную стоимость как повседневных предметов, так и настоящих сокровищ вроде археотехнологических артефактов или произведений искусства.',
    )
    let gamble = new Skill(
        'Азартные игры',
        'int',
        'С помощью этого умения можно принимать участие в играх на удачу, таких как карточные игры или более простые (и часто сопряженные с насилием) кости, излюбленная игра низших классов.',
    )
    let inquiry = new Skill(
        'Сбор информации',
        'cha',
        'Это умение собирать слухи, секреты и тайную информацию, задавая вопросы, угощая напитками и просто приглядываясь и прислушиваясь ко всему, что может всплыть в случайном разговоре.',
    )
    let intimidate = new Skill(
        'Запугивание',
        'str',
        'Тест на Запугивание пригодится, когда тебе придет в голову вселить страх в отдельного человека или небольшую группу людей. Тебе не нужно проходить Тест Запугивания каждый раз, когда ты угрожаешь кому-либо.',
    )
    let logic = new Skill(
        'Логика',
        'int',
        'Это умение отражает твою способность делать выводы и заключения, а также решать математические задачи.'
    )
    let scrutiny = new Skill(
        'Проницательность',
        'per',
        'Это умение используется, чтобы оценивать людей, с которыми ты встречаешься, определять, лжет ли тот или иной человек, чувствовать его мотивы, а также понимать в общих чертах – стоит человек доверия или же нет.',
    )
    let search = new Skill(
        'Поиск',
        'per',
        'Используй этот навык каждый раз, когда хочешь изучить то или иное место напредмет спрятанных вещей, улик и вообще всего, что можно спрятать. Поиск отличается от Бдительности тем, что Бдительность работает пассивно, срабатывая, когда имеют место быть скрытые опасности или крохотные детали, которые можно случайно заметить, проходя мимо. Поиск, с другой стороны, это активный процесс, непосредственная и явная попытка тщательного обыска.',
    )
    let silent_move = new Skill(
        'Бесшумный шаг',
        'dex',
        'Используй это умение, когда хочешь прошвырнуться по окрестностям, не производя ненужного шума.',
    )
    let survival = new Skill("Выживание", 'int')
    let swim = new Skill(
        'Плавание',
        'str',
        'Это умение используется при плавании и нырянии. Плавание в нормальных условиях не требует Тестов. Они, однако, могут потребоваться если водоем неспокоен или если плавание длится достаточно долго.',
    )
    let track = new Skill("Выслеживание", 'int')

    let drive_land = new Skill("Вождение (наземный)", 'dex')
    
    let language_gothic_low = new Skill("Язык (Низкий Готик)", 'int')
    let language_tribal = new Skill("Язык (племенной диалект)", 'int')
    let language_local_dusk = new Skill("Язык (диалект Даска)", 'int')

    let lore_common = new Skill(
        'Обыденное знание',
        'int',
        'Набор воспоминаний о привычках, структуре, традициях, знаменитых деятелях и суевериях, относящихся к отдельным мирам, культурным группам и организациям.',
    )
    let lore_common_dusk = subSkill(lore_common, 'Фольклор Даска')

    let lore_forbidden_demonology = new Skill("Запретное знание (демонология)", 'int')
    let lore_scholastic_occult = new Skill("Учёное знание (оккультизм)", 'int')
    return {
        'navigation_land': navigation_land,
        'awareness': awareness,
        'barter': barter,
        'blather': blather,
        'carouse': carouse,
        'charm': charm,
        'chemuse': chemuse,
        'ciphers_acolyte': ciphers_acolyte,
        'ciphers_battle': ciphers_battle,
        'ciphers_secret_society': ciphers_secret_society,
        'ciphers_occult': ciphers_occult,
        'ciphers_criminal': ciphers_criminal,
        'climb': climb,
        'command': command,
        'concealment': concealment,
        'contortionist': contortionist,
        'deceive': deceive,
        'disguise': disguise,
        'dodge': dodge,
        'evaluate': evaluate,
        'gamble': gamble,
        'inquiry': inquiry,
        'intimidate': intimidate,
        'logic': logic,
        'scrutiny': scrutiny,
        'search': search,
        'silent_move': silent_move,
        'swim': swim,
        'survival': survival,
        'track': track,
        'drive_land': drive_land,
        'language_gothic_low': language_gothic_low,
        'language_tribal': language_tribal,
        'language_local_dusk': language_local_dusk,
        'lore_forbidden_demonology': lore_forbidden_demonology,
        'lore_scholastic_occult': lore_scholastic_occult,
        'lore_common_dusk': lore_common_dusk,
    }
}()

/* Тут перечисляются все способности
 * Шаблон примерно такой
 *
 *     <talentname>: new Talent('<Название>', '<Описание>', [<зависимость1>, <зависимость2>]),
 * 
 * <talentname> пригодится ниже, набор латинских букв без пробелов
 * <зависимостьN> — требование для таланта
 * 
 *     new Requirement(new Stats().copy({<код характеристики 1>: <мин значение 1>, <код характеристики 2>: <мин значение 2>})),
 * 
 * Не забудь запятуе в конце!
 */

let talents = {
    // wild world talents
    iron_guts: new Talent("Железное нутро"),
    savage: new Talent("Дикарь"),
    init_rites: new Talent("Ритуалы инициации"),
    nothing_more_to_fear: new Talent("Нечего больше бояться"),

    // normal
    ambidexter: new Talent(
        "Амбидекстрия", 
        "Ты можешь пользоваться одинаковохорошо обеими руками. Ты не получаешь обычного штрафа -20 за атаку неосновной рукой. Если ты обладаешь Талантом Две Руки, штраф за атаку с двух рук падает до -10.",
        [
            new Requirement(new Stats().copy({ dex: 30 })),
        ]
    ),
    unremarcable: new Talent("Непримечательный"),

    // weapon
    weapon_throw: new Talent("Метательное оружие"),
    weapon_cqc_prim: new Talent("Оружие ближнего боя (прим)"),
    weapon_hand_prim: new Talent("Пистолеты (прим)"),
    weapon_hand_laz: new Talent("Пистолеты (лаз)"),
    weapon_hand_stub: new Talent("Пистолеты (стаб)"),
    weapon_main_prim: new Talent("Основное оружие (прим)"),
    weapon_main_laz: new Talent("Основное оружие (лаз)"),
    weapon_main_stub: new Talent("Основное оружие (стаб)"),
}

let baseSkills = [
    skills.awareness,
    skills.barter,
    skills.carouse,
    skills.charm,
    skills.climb,
    skills.command,
    skills.concealment,
    skills.contortionist,
    skills.deceive,
    skills.disguise,
    skills.dodge,
    skills.evaluate,
    skills.gamble,
    skills.inquiry,
    skills.intimidate,
    skills.logic,
    skills.scrutiny,
    skills.search,
    skills.silent_move,
    skills.swim,
]

/* Профы состоят из
 *
 *  - Название
 *  - Схема прокачки статов
 *  - Умений (в случае или-или — помести в [список])
 *  - Талантов (в случае или-или — помести в [список])
 */

let profs = {
    adept: new Prof('Адепт'),
    judge: new Prof('Арбитр'),
    killer: new Prof(
        'Убийца', // название
        new StatUpgrades(
            sud.fast, // cqc
            sud.fast, // ballistic
            sud.hard, // str
            sud.med,  // con
            sud.main, // dex
            sud.med,  // int
            sud.med,  // perception
            sud.med,  // willpower
            sud.hard, // fellowship
        ),
        [
            skills.awareness, // умение "Бдительность"
            skills.dodge,
            skills.language_gothic_low,
        ],
        [
            talents.weapon_cqc_prim, // талант "Оружие ближнего боя (примитив)"
            [talents.ambidexter, talents.unremarcable], // либо амбидекстр, либо непримечательный
            [talents.weapon_throw, talents.weapon_hand_laz],
            talents.weapon_main_stub,
            talents.weapon_hand_stub,
        ]
    ),
    cleric: new Prof('Клирик'),
    guard: new Prof(
        'Гвардеец',
        new StatUpgrades(
            sud.fast, // cqc
            sud.fast, // ballistic
            sud.main, // str
            sud.med,  // con
            sud.med,  // dex
            sud.hard, // int
            sud.med,  // perception
            sud.hard, // willpower
            sud.hard, // fellowship
        ),
        [
            skills.language_gothic_low,
            [skills.drive_land, skills.swim],
        ],
        [
            talents.weapon_cqc_prim,
            [talents.weapon_hand_prim, talents.weapon_hand_laz],
            talents.weapon_main_laz,
            [talents.weapon_main_prim, talents.weapon_main_stub],
        ]
    ),
    psy: new Prof('Псайкер'),
    scum: new Prof('Подонок'),
    tech: new Prof('Техножрец'),
}

/* Самая дичь тут — родной мир
 * Состоит из:
 * 
 *  - Названия
 *  - Базовых статов
 *  - Доступных профессий
 *  - Навыков
 *  - Талантов
 *  - Дополнительных модификаторов к очкам судьбы, порче, безумию и ранам
 *  - Базовых ран
 *  - Таблицы очков судьбы
 *  - Таблицы телосложения
 *  - Таблицы возраста
 *  - Таблицы внешнего вида
 *  - Таблицы примет
 *  - Таблицы особенности мира
 */
let origins = function () {
    let wild = new Origin(
        "Дикий мир", // Название
        new Stats(20, 20, 25, 25, 20, 20, 20, 15, 15), // Базовые статы: ББ, Б, Сил и т.д. (см. function Stats чтобы увидеть порядок)
        [// Доступные профессии (ссылки из объекта profs, он выше):
            new RollableOption(profs.killer, 1, 30), // Убийца (на 01-30)
            new RollableOption(profs.guard, 31, 80), // Гвардос (на 31-80)
            new RollableOption(profs.psy, 81, 90),
            new RollableOption(profs.scum, 91, 100),
        ],
        [// Навыки (ссылки из объекта skills, он выше)
            [skills.navigation_land, skills.survival, skills.track], // Базовые (если их нет, то [])
            [skills.language_tribal], // Продвинутые
        ],
        [// Таланты (ссылки из объекта talents, он выше, ограничения игнорируются)
            talents.iron_guts,
            talents.savage,
            talents.init_rites,
        ],
        new SecondaryMods(), // Обычно дополнительные модификаторы отсутствуют
        9, // Базовые раны
        [// Таблица очков судьбы
            new RollableOption(1, 1, 4),  // Одно на 1-4
            new RollableOption(2, 5, 10), // Два на 5-10
        ],
        mkConstVariants( // Варианты сложения, по три значения, м/ж, пять вариантов
            "поджарый", 190, 65, "поджарая", 180, 60,
            "тощий", 175, 60, "тощая", 165, 55,
            "мускулистый", 185, 85, "мускулистая", 170, 70,
            "коренастый", 165, 80, "коренастая", 155, 70,
            "здоровенный", 210, 120, "здоровенная", 200, 100
        ),
        [// Возраст
            new RollableOption(new Age("Воин", 15), 1, 70), // 15+к10 лет на 1-70
            new RollableOption(new Age("Старейшина", 25), 71, 100), // 25+к10 лет на 71-100
        ],
        mkAppearences( // Варианты раскраски, 5 штук
            "тёмная", "рыжие", "голубые",
            "загорелая", "светлые", "серые",
            "светлая", "русые", "карие",
            "красная", "чёрные", "зелёные",
            "бронзовая", "седые", "жёлтые",
        ),
        mkMarks( // 16 примет
            'Волосатые Костяшки',
            'Сросшиеся Брови',
            'Боевая Раскраска',
            'Ладони-лопаты',
            'Редкие Зубы',
            'Кустистые Брови',
            'Мускусный Запах',
            'Волосатый',
            'Рваные Уши',
            'Длинные Ногти',
            'Племенные Татуировки',
            'Скарификация',
            'Пирсинг',
            'Кошачьи Глаза',
            'Маленькая Голова',
            'Массивная Челюсть',
        ),
        [// Верования племён (касты улья, родной флот и т.п.)
            new RollableOption('Печать Грязи: Мытье позволяет враждебным духам учуять тебя. Ты должен поддерживать защитный слой грязи, чтобы отпугнуть несчастье, что несут с собой злые духи.', 1, 10),
            new RollableOption('Несчастливый Цвет: Оранжевый – цвет несчастья и смерти.', 11, 20),
            new RollableOption('Клятва Охотника: Никогда не ешь того, что убито не тобой, иначе судьба страшно покарает тебя за твоё отступничество.', 21, 30),
            new RollableOption('Жаждущий Клинок: Дух твоего оружия – голодный призрак. Он должен испробовать крови каждый раз, как покидает ножны, или расплата не заставит себя ждать.', 31, 40),
            new RollableOption('Духовные Узы: Если ты возьмешь трофей с тела поверженного врага, ты заберешь саму его душу.', 41, 50),
            new RollableOption('Смерть Воина: Твой народ почитает славную смерть, в то время как смерть труса позорна. Твои предки смотрят на тебя; не разочаруй их.', 51, 60),
            new RollableOption('Сила Имен: Никогда не произноси истинных имен твоих друзей и близких, ибо демоны могут услышать их и сотворить зло.', 61, 70),
            new RollableOption('Одинокая Смерть: Никогда не упоминай имен мёртвых, ибо так ты призовешь их души из тьмы.', 71, 80),
            new RollableOption('Живое Письмо: Вырезай все победы на своей коже, ибо когда после смерти ты предстанешь перед Императором, именно по твоей шкуре Он прочтет о твоих деяниях.', 81, 90),
            new RollableOption('Роковая Судьба: Император уже определил, когда и как ты умрешь. Где-то уже бродит та тварь, что убьёт тебя. Твоя судьба – найти эту тварь и встретить её лицом к лицу. Ты знаешь, что до той поры ничто не повредит тебе.', 91, 100),
        ],
    )
    let wild_dusk = new Origin(
        "Дикий мир (Даск)",
        wild.stats.copy({'wil': +3, 'per': +3}), // Те же статы, что и в диком мире, но СВ и Вос по +3
        wild.profs,
        [
            [skills.navigation_land, skills.survival, skills.track, skills.lore_forbidden_demonology, skills.lore_scholastic_occult], // base
            [skills.language_local_dusk, skills.lore_common_dusk], // +0
        ],
        [
            talents.savage,
            talents.nothing_more_to_fear,
        ],
        new SecondaryMods(
            idf,                      // Раны не меняются (idf)
            x => { return x + d5() }, // Коррупция +к5
            x => { return x + d5() }, // Поехавшесть +к5
            x => { return x - 1 },    // Судьба -1
        ),
        wild.baseWounds, // Остальное такое же, как в диком мире
        wild.fateChances,
        wild.constitutions,
        wild.ages,
        wild.appearences,
        wild.marks,
        wild.specialTrait,
    )
    return { // ОБЯЗАТЕЛЬНО ВНЕСТИ СЮДА
        'wild': wild,
        'wild_dusk': wild_dusk,
    }
}()

// Если мир не является вариантом другого, то его можно вписать сюда с соответствующим диапазоном
let rollableOrigins = [
    new RollableOption(origins.wild, 1, 15), // 00-15: Дикий мир
]

// endregion

// region machinery

function RenderedSkill(
    skill,
    level,
    skillOrigin,
) {
    this.skill = skill
    this.level = level
    this.skillOrigin = skillOrigin
}

function RenderedTalent(
    talent,
    talentOrigin,
) {
    this.talent = talent
    this.talentOrigin = talentOrigin
}

function sFromOrigin(
    skill, lvl, ix
) {
    return new RenderedSkill(skill, lvl, { from: 'origin', ix: ix })
}

function sFromProf(
    skill, lvl, ix
) {
    return new RenderedSkill(skill, lvl, { from: 'prof', ix: ix })
}

function sFromAdvanced(
    skill, lvl, exp
) {
    return new RenderedSkill(skill, lvl, { from: 'buy', cost: exp })
}

function tFromOrigin(
    skill, ix
) {
    return new RenderedTalent(skill, { from: 'origin', ix: ix })
}

function tFromProf(
    skill, ix
) {
    return new RenderedTalent(skill, { from: 'prof', ix: ix })
}

function tFromAdvanced(
    skill, exp
) {
    return new RenderedTalent(skill, { from: 'buy', cost: exp })
}

let character = {
    rolledStats: new Stats(),
    statUpgrades: new Stats(),
}
// let character = function () {
//     let origin = origins.wild // todo: roll
//     let prof = rollOption(origin.profs)
//     return {
//         rolledStats: new Stats(),
//         origin: origin,
//         prof: prof,
//         skills: [],
//     }
// }()

let rsCompare = (rsa, rsb) => rsa.level - rsb.level

let vm = {}

function render() {
    if (character.rolledStats !== undefined && character.origin != undefined) {
        Object.keys(vm.stats).forEach(s => {
            vm.stats[s].innerText = String(character.rolledStats[s] + character.origin.stats[s] + character.statUpgrades[s])
        })
    }
    let renderSkills = vm.renderSkills
    var usedExp = 0
    if (character.prof !== undefined) {
        let upTable = character.prof.statUpgrades
        vm.statUpTable.innerHTML = ''
        for (let s of Object.keys(upTable)) {
            let r = document.createElement('tr')
            let name = document.createElement('td')
            name.innerText = statNames[s]
            r.append(name)
            for (let i = 0; i < 4; ++i) {
                let cell = document.createElement('td')
                let curCSU = character.statUpgrades[s]
                let curTSU = (i + 1) * 5
                let cost = upTable[s][i]
                cell.innerText = String(cost)
                if (curCSU >= curTSU) {
                    cell.className = 'taken'
                    usedExp += cost
                } else {
                    cell.className = ''
                }
                if (curTSU === curCSU) {
                    cell.onclick = function () {
                        character.statUpgrades[s] -= 5
                        render()
                    }
                } else if (curCSU + 5 === curTSU) {
                    cell.onclick = function () {
                        character.statUpgrades[s] += 5
                        render()
                    }
                }
                r.append(cell)
            }
            vm.statUpTable.append(r)
        }
    }
    if (renderSkills !== undefined && character.skills !== undefined) {
        renderSkills(character.skills)
        character.skills.forEach((v) => {
            for (let s of v) {
                let o = s.skillOrigin
                if (o.from == 'buy') {
                    usedExp += o.cost
                }
            }
        })
    }
    let renderTalents = vm.renderTalents
    if (renderTalents !== undefined && character.talents !== undefined) {
        renderTalents(character.talents)
        for (let t of character.talents) {
            let o = t.talentOrigin
            if (o.from == 'buy') {
                usedExp += o.cost
            }
        }
    }
    // TODO: add exp for stat upgrades
    vm.usedExpSpan.innerText = String(usedExp)
    delayed.innerHTML = ''
    function renderDelayed(del, norm, add) {
        if (del !== undefined) {
            for (let i = 0; i < del.length; ++i) {
                let li = document.createElement('li')
                let ds = del[i]
                for (let s of ds.lst) {
                    let opt = document.createElement('div')
                    opt.innerText = s.name
                    opt.onclick = function () {
                        add(norm, s, ds.from, ds.ix)
                        del.splice(i, 1)
                        render()
                    }
                    li.append(opt)
                }
                delayed.append(li)
            }
        }
    }
    renderDelayed(character.delayedSkills, character.skills, (taken, s, from, ix) => {
        let newRS = new RenderedSkill(s, 1, { from: from, ix: ix })
        if (!taken.has(s.name)) {
            taken.set(s.name, [])
        }
        let rsl = taken.get(s.name)
        rsl.push(newRS)
        rsl.sort(rsCompare)
    })
    renderDelayed(character.delayedTalents, character.talents, (taken, s, from, ix) => taken.push(new RenderedTalent(s, { from: from, ix: ix })))
    vm.woundSpan.innerText = String(character.wounds)
    vm.fateSpan.innerText = String(character.fate)
    vm.corruptSpan.innerText = String(character.corrupt)
    vm.madnessSpan.innerText = String(character.madness)
    vm.sexBox.value = character.sex
    vm.handBox.value = character.hand
    vm.specialSpan.innerText = String(character.specialTrait)
    if (character.constitution !== undefined) {
        vm.constDescriptionSpan.innerText = String(character.constitution[character.sex].description)
        vm.heightSpan.innerText = String(character.constitution[character.sex].height)
        vm.weightSpan.innerText = String(character.constitution[character.sex].weight)
    }
    if (character.age !== undefined) {
        vm.ageSpan.innerText = String(character.age.n)
        vm.ageDescriptionSpan.innerText = String(character.age.d)
    }
    if (character.appearence !== undefined) {
        vm.hair.innerText = character.appearence.hair
        vm.eyes.innerText = character.appearence.eyes
        vm.skin.innerText = character.appearence.skin
    }
    if (character.marks !== undefined) {
        vm.marksSpan.innerHTML = ''
        for (let m of character.marks) {
            let ms = document.createElement('span')
            ms.innerText = '\x20(X),\x20'
            ms.onclick = function () {
                character.marks.splice(character.marks.indexOf(m), 1)
                render()
            }
            vm.marksSpan.append(
                document.createTextNode(m),
                ms,
            )
        }
    }
    if (character.names !== undefined) {
        vm.namesSpan.innerHTML = ''
        for (let n of character.names) {
            let ns = document.createElement('span')
            ns.innerText = '\x20(X)\x20'
            ns.onclick = function () {
                character.names.splice(character.names.indexOf(n), 1)
                render()
            }
            vm.namesSpan.append(
                document.createTextNode(n),
                ns,
            )
        }
    }
    vm.rollLog.innerText = rollLog.join('')
}

function buildCharacter() {
    console.log('build character')
    let o = character.origin
    let p = character.prof
    character.skills = baseSkills.map(s => new RenderedSkill(s, 0, { from: 'base' }))
    character.talents = []
    character.delayedSkills = []
    character.delayedTalents = []
    if (o !== undefined) {
        for (let lvl = 0; lvl < o.skills.length; ++lvl) {
            let onLvl = o.skills[lvl]
            for (let i = 0; i < onLvl.length; ++i) {
                let s = onLvl[i]
                if (Array.isArray(s)) {
                    character.delayedSkills.push({ lst: s, from: 'origin', ix: i })
                } else {
                    character.skills.push(sFromOrigin(s, lvl, i))
                }
            }
        }
        let ts = o.talents
        for (let i = 0; i < ts.length; ++i) {
            let t = ts[i]
            if (Array.isArray(t)) {
                character.delayedTalents.push({ lst: t, from: 'origin', ix: i })
            } else {
                character.talents.push(tFromOrigin(t, i))
            }
        }
    }
    if (p !== undefined) {
        let ss = p.skills
        for (let i = 0; i < ss.length; ++i) {
            let s = ss[i]
            if (Array.isArray(s)) {
                character.delayedSkills.push({ lst: s, from: 'prof', ix: i })
            } else {
                character.skills.push(sFromProf(s, 1, i))
            }
        }
        let ts = p.talents
        for (let i = 0; i < ts.length; ++i) {
            let t = ts[i]
            if (Array.isArray(t)) {
                character.delayedTalents.push({ lst: t, from: 'prof', ix: i })
            } else {
                character.talents.push(tFromProf(t, i))
            }
        }
    }
    let res = new Map()
    for (let rs of character.skills) {
        var rsl = res.get(rs.skill.name)
        if (rsl === undefined) {
            rsl = []
        }
        rsl.push(rs)
        res.set(rs.skill.name, rsl)
    }
    res.forEach(v => v.sort(rsCompare))
    character.skills = res
}

function bind() {
    vm.rollLog = document.getElementById('rollLog')
    // stats
    vm.stats = {}
    vm.woundSpan = document.getElementById('wounds')
    let woundRoll = document.getElementById('woundRoll')
    woundRoll.onclick = function () {
        if (character.origin !== undefined) {
            let w = character.origin.baseWounds
            character.wounds = character.origin.secondaryMods.wounds(w + d5())
        } else {
            character.wounds = 0
        }
        render()
    }
    vm.fateSpan = document.getElementById('fate')
    let fateRoll = document.getElementById('fateRoll')
    fateRoll.onclick = function () {
        if (character.origin !== undefined) {
            let f = rollOption(character.origin.fateChances, d10)
            character.fate = character.origin.secondaryMods.fate(f)
        } else {
            character.fate = 0
        }
        render()
    }
    vm.corruptSpan = document.getElementById('corrupt')
    let corruptRoll = document.getElementById('corruptRoll')
    corruptRoll.onclick = function () {
        if (character.origin !== undefined) {
            character.corrupt = character.origin.secondaryMods.corrupt(0)
        } else {
            character.corrupt = 0
        }
        render()
    }
    vm.madnessSpan = document.getElementById('madness')
    let madnessRoll = document.getElementById('madnessRoll')
    madnessRoll.onclick = function () {
        if (character.origin !== undefined) {
            character.madness = character.origin.secondaryMods.madness(0)
        } else {
            character.madness = 0
        }
        render()
    }

    vm.sexBox = document.getElementById('sex')
    vm.sexBox.onchange = function () {
        character.sex = vm.sexBox.value
        render()
    }
    document.getElementById('sexRoll').onclick = function () {
        let r = d10()
        character.sex = r % 2 == 0 ? 'male' : 'female'
        render()
    }

    vm.handBox = document.getElementById('hand')
    vm.handBox.onchange = function () {
        character.hand = vm.handBox.value
        render()
    }
    document.getElementById('handRoll').onclick = function () {
        let r = d10()
        character.hand = r == 9 ? 'left' : 'right'
        render()
    }

    vm.constDescriptionSpan = document.getElementById('constitution')
    vm.heightSpan = document.getElementById('height')
    vm.weightSpan = document.getElementById('weight')
    document.getElementById('constitutionRoll').onclick = function () {
        if (character.sex !== undefined && character.origin !== undefined) {
            character.constitution = rollOption(character.origin.constitutions)
            render()
        }
    }

    vm.ageSpan = document.getElementById('age')
    vm.ageDescriptionSpan = document.getElementById('ageDescription')
    document.getElementById('ageRoll').onclick = function () {
        if (character.origin !== undefined) {
            let ageType = rollOption(character.origin.ages)
            character.age = {
                n: ageType.roll(),
                d: ageType.description,
            }
            render()
        }
    }

    vm.skin = document.getElementById('skin')
    vm.hair = document.getElementById('hair')
    vm.eyes = document.getElementById('eyes')
    document.getElementById('appearanceRoll').onclick = function () {
        if (character.origin !== undefined) {
            character.appearence = rollOption(character.origin.appearences)
            render()
        }
    }

    vm.specialSpan = document.getElementById('specialOO')
    document.getElementById('specialOORoll').onclick = function () {
        if (character.origin !== undefined) {
            character.specialTrait = rollOption(character.origin.specialTrait)
            render()
        }
    }

    vm.marksSpan = document.getElementById('marks')
    document.getElementById('clearAllMarks').onclick = function () {
        character.marks = []
        render()
    }
    document.getElementById('addMark').onclick = function () {
        if (character.origin !== undefined) {
            if (character.marks === undefined) {
                character.marks = []
            }
            var newMark = undefined
            var bcntr = 0
            do {
                newMark = rollOption(character.origin.marks)
                ++bcntr
            } while (character.marks.includes(newMark) && bcntr < 100)
            character.marks.push(newMark)
            render()
        }
    }

    vm.namesSpan = document.getElementById('names')
    document.getElementById('clearAllNames').onclick = function () {
        character.names = []
        render()
    }
    document.getElementById('addName').onclick = function () {
        if (character.sex !== undefined) {
            if (character.names === undefined) {
                character.names = []
            }
            let allNames = nameTable[character.sex]
            var newName = undefined
            var bcntr = 0
            do {
                newName = rollOption(rollOption(allNames, d5))
                ++bcntr
            } while (character.names.includes(newName) && bcntr < 100)
            character.names.push(newName)
            render()
        }
    }

    vm.usedExpSpan = document.getElementById('usedExp')

    vm.statUpTable = document.getElementById('statUpgrades')

    let stats = document.getElementById('stats')
    function bindStatDice(statId) {
        return function () {
            if (character.rolledStats !== undefined) {
                character.rolledStats[statId] = d10() + d10()
                render()
            }
        }
    }
    for (let s of stats.querySelectorAll('div.stat-val')) {
        s.innerHTML = ""
        let sv = document.createElement('div')
        s.append(sv)
        vm.stats[s.id] = sv
        let re = document.createElement('img')
        re.src = "d10.svg"
        re.width = 24
        re.height = 24
        re.onclick = bindStatDice(s.id)
        re.className = "roll24"
        s.append(re)
    }
    document.getElementById('fullStatRoll').onclick = function () {
        let rs = new Stats()
        for (let k of Object.keys(rs)) {
            rs[k] = d10() + d10()
        }
        character.rolledStats = rs
        render()
    }
    let world = document.getElementById('world')
    for (let o of Object.keys(origins)) {
        let option = document.createElement('option')
        option.value = o
        option.text = origins[o].name
        if (character.origin !== undefined && character.origin.name == o.name) option.selected = true
        world.append(option)
    }
    world.onchange = function () {
        let oldOrigin = character.origin
        character.origin = origins[world.value]
        if (oldOrigin === undefined || (character.origin !== undefined && oldOrigin.name !== character.origin.name)) {
            professions.innerHTML = ''
            for (let p of character.origin.profs) {
                let option = document.createElement('option')
                option.value = p.id.name
                option.text = p.id.name + ' [' + p.low + '..' + p.high + ']'
                if (character.prof !== undefined && character.prof.name == p.id.name) option.selected = true
                professions.append(option)
            }
            if (character.prof !== undefined) {
                character.prof = character.origin.profs.find(p => character.prof.name == p.id.name).id
            }
            buildCharacter()
            // if (np === undefined) {
            //     character.prof = rollOption(character.origin.profs)
            // } else {
            //     character.prof = np
            // }
            render()
        } else {
        }
    }
    let professions = document.getElementById('prof')
    professions.onchange = function () {
        if (character.origin !== undefined) {
            console.log('new prof: ' + professions.value)
            let oldProf = character.prof
            character.prof = character.origin.profs.find(x => x.id.name == professions.value).id
            console.log('found prof: ' + character.prof)
            if (oldProf === undefined || (character.prof !== undefined && oldProf.name != character.prof.name)) {
                character.skills = new Map()
                character.talents = []
                buildCharacter()
                render()
            }
        }
    }
    professions.onchange()
    let skillBox = document.getElementById('skills')
    vm.renderSkills = function (toRender) {
        skillBox.innerHTML = ''
        toRender.forEach((v) => {
            if (v.length == 0) return
            let r = v[v.length - 1]
            let row = document.createElement('tr')
            let sName = document.createElement('td')
            let s00 = document.createElement('td')
            let s10 = document.createElement('td')
            let s20 = document.createElement('td')
            let sOrigin = document.createElement('td')
            sName.innerText = r.skill.name + ' (' + statNames[r.skill.statId] + ')'
            sName.title = r.skill.description
            let lvl = r.level
            if (lvl >= 1) s00.className = 'filled'; else s00.className = 'clear'
            if (lvl >= 2) s10.className = 'filled'; else s10.className = 'clear'
            if (lvl >= 3) s20.className = 'filled'; else s20.className = 'clear'
            let o = r.skillOrigin
            if (o.from == 'origin') {
                let ix = o.ix
                let s = character.origin.skills[lvl][ix]
                if (Array.isArray(s)) {
                    sOrigin.innerText = 'Мир (изм.)'
                    sOrigin.onclick = function () {
                        let rsl = character.skills.get(r.skill.name)
                        rsl.pop()
                        if (rsl.length == 0) {
                            character.skills.delete(r.skill.name)
                        }
                        character.delayedSkills.push({ lst: s, from: 'origin', ix: ix })
                        render()
                    }
                } else {
                    sOrigin.innerText = 'Мир'
                }
            } else if (o.from == 'prof') {
                let ix = o.ix
                let s = character.prof.skills[ix]
                if (Array.isArray(s)) {
                    sOrigin.innerText = 'Про (изм.)' 
                    sOrigin.onclick = function () {
                        let rsl = character.skills.get(r.skill.name)
                        rsl.pop()
                        if (rsl.length == 0) {
                            character.skills.delete(r.skill.name)
                        }
                        character.delayedSkills.push({ lst: s, from: 'prof', ix: ix })
                        render()
                    }
                } else {
                    sOrigin.innerText = 'Профессия'
                }
            } else if (o.from == 'buy') {
                sOrigin.innerText = o.cost + ' ОО'
            } else if (o.from == 'base') {
                sOrigin.innerText = 'Базовый'
            }
            row.append(sName, s00, s10, s20, sOrigin)
            skillBox.append(row)
        })
    }
    vm.talents = document.getElementById('talents')
    vm.renderTalents = function (toRender) {
        vm.talents.innerHTML = ''
        for (let r of toRender) {
            let row = document.createElement('tr')
            let sName = document.createElement('td')
            let sOrigin = document.createElement('td')
            sName.innerText = r.talent.name
            sName.title = r.talent.description
            let o = r.talentOrigin
            if (o.from == 'origin') {
                let ix = o.ix
                let s = character.origin.talents[ix]
                if (Array.isArray(s)) {
                    sOrigin.innerText = 'Мир (изм.)'
                    sOrigin.onclick = function () {
                        character.talents.splice(character.talents.findIndex(x => x.talent.name == r.talent.name), 1)
                        character.delayedTalents.push({ lst: s, from: 'origin', ix: ix })
                        render()
                    }
                } else {
                    sOrigin.innerText = 'Мир'
                }
            } else if (o.from == 'prof') {
                let ix = o.ix
                let s = character.prof.talents[ix]
                if (Array.isArray(s)) {
                    sOrigin.innerText = 'Про (изм.)' 
                    sOrigin.onclick = function () {
                        character.talents.splice(character.talents.findIndex(x => x.talent.name == r.talent.name), 1)
                        character.delayedTalents.push({ lst: s, from: 'prof', ix: ix })
                        render()
                    }
                } else {
                    sOrigin.innerText = 'Профессия'
                }
            } else if (o.from == 'buy') {
                sOrigin.innerText = o.cost + ' ОО'
            }
            row.append(sName, sOrigin)
            vm.talents.append(row)
        }
    }
    vm.delayed = document.getElementById('delayed')
}

function init() {
    bind()
    render()
    console.log('init called')
}

window.onload = init

// endregion
