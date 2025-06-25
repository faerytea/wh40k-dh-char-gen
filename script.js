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
    prof = undefined,
) {
    this.stats = stats
    this.talents = talents
    this.prof = prof
}

function Talent(
    name,
    description = "",
    requirements = new Requirement(),
) {
    this.name = name
    this.description = description
    this.requirements = requirements
}

function subTalent(talent, specName, specDescr, specReq) {
    let res = new Talent(
        talent.name + ' (' + specName + ')',
        talent.description.replaceAll('$$', specDescr === undefined ? specName : specDescr),
        specReq === undefined ? talent.specReq : specReq,
    )
    res.parent = talent
    res.specName = specName
    return res
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

function UpS(
    option,
    level,
    cost,
) {
    this.option = option
    this.level = level
    this.cost = cost
}

function UpT(
    option,
    cost,
    repeatable = false,
) {
    this.option = option
    this.cost = cost
    this.repeatable = repeatable
}

function Rank(
    name,
    level,
    skills,
    talents,
) {
    this.name = name
    this.level = level
    this.skills = skills
    this.talents = talents
}

function Prof(
    name,
    statUpgrades,
    skills = [],
    talents = [],
    ranks = [],
    backgrounds = [],
) {
    this.name = name
    this.statUpgrades = statUpgrades
    this.skills = skills
    this.talents = talents
    this.ranks = ranks
    this.backgrounds = backgrounds
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

function Background(
    name,
    cost,
    specialNote,
    allowedOrigin,
    skills = [],
    talents = [],
    statMod = new Stats(),
    secondaryMods = new SecondaryMods(),
) {
    this.name = name
    this.cost = cost
    this.specialNote = specialNote
    this.allowedOrigin = allowedOrigin
    this.skills = skills
    this.talents = talents
    this.statMod = statMod
    this.secondaryMods = secondaryMods
}

function PsyMod(
    stats = new Stats(),
    secondaryMods = new SecondaryMods(idf, idf, idf, idf),
    talents = [],
) {
    this.stats = stats
    this.secondaryMods = secondaryMods
    this.talents = talents
}

function SanctionationSideEffect(
    name,
    description,
    mod = new PsyMod(),
) {
    this.name = name
    this.description = description
    this.mod = mod
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
    let ciphers_secret_society_hetairea = subSkill(ciphers, 'Тайное общество — Хетаирея', 'Используется академиками Хетаиреи для идентификации себе подобных и передачи простых сообщений.')
    let ciphers_secret_society_sollex = subSkill(ciphers, 'Тайное общество — Соллекс', 'Используется культистами Соллекса для идентификации себе подобных и передачи простых сообщений.')
    let ciphers_blades = subSkill(ciphers, 'Клинки Звёзд', '')
    let ciphers_maligris = subSkill(ciphers, 'Кодекс Малигрс', '')
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
    let demolition = new Skill(
        'Взрывотехника',
        'int',
        'Используй это умение, чтобы взрывать нужные цели и не подрываться при этом самому!',
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
    let interrogation = new Skill(
        'Допрос',
        'wil',
        'Ключевой инструмент в арсенале Инквизиции есть допрос – умение вытаскивать качественную информацию из нежелающего этому поспособствовать объекта.',
    )
    let intimidate = new Skill(
        'Запугивание',
        'str',
        'Тест на Запугивание пригодится, когда тебе придет в голову вселить страх в отдельного человека или небольшую группу людей. Тебе не нужно проходить Тест Запугивания каждый раз, когда ты угрожаешь кому-либо.',
    )
    let invocation = new Skill(
        'Инвокация',
        'wil',
        'Тест на Инвокацию позволяет усилить твой следующий Психотест на число, равное твоему Бонусу Силы Воли. Во время этого Действия ты очищаешь свой разум при помощи различных ментальных техник – медитаций, чтения мантр, прикосновений к психофокусу и т.п.',
    )
    let literacy = new Skill(
        'Грамотность',
        'int',
        'Это умение позволяет тебе читать на любом известном тебе языке. В обычной повседневной ситуации Тест на Грамотность при чтении и письме не нужен, но Мастер может потребовать его прохождения при попытке чтения текста, записанного неразборчиво, слишком сложно или слишком образно, или обильно пересыпанного забытыми фразеологизмами, архаичными словесными конструкциями или редкими идиомами.',
    )
    let logic = new Skill(
        'Логика',
        'int',
        'Это умение отражает твою способность делать выводы и заключения, а также решать математические задачи.'
    )
    let psyniscience = new Skill(
        'Психической чутьё',
        'per',
        'При помощи этого умения ты можешь настраивать свое восприятие на пертурбации потоков имматериума.',
    )
    let security = new Skill(
        'Безопасность',
        'dex',
        'При помощи этого умения можно обходить замки и прочие системы безопасности.',
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
    let shadowing = new Skill(
        'Слежка',
        'dex',
        'Это умение позволяет следовать за другим существом или транспортным средством, оставаясь при этом незамеченным.',
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
    let techuse = new Skill(
        'Технология',
        'int',
        'При помощи этого умения персонаж может использовать и ремонтировать различные механизмы, а также хотя бы примерно угадывать, как работает тот или иной техноартефакт.',
    )
    let track = new Skill("Выслеживание", 'int')

    let drive = new Skill('Вождение', 'dex', 'Простое вождение не требует прохождения Тестов. Тест необходим лишь в случае езды по сложному ландшафту, с предельной скоростью или при совершении опасных маневров. При погоне Состязательные Тесты Вождения проводятся между участвующими в ней водителями.')
    let drive_land = subSkill(drive, 'Наземный', 'колёсный, гусеничный и прочий приземлённый транспорт.')
    let drive_hover = subSkill(drive, 'Ховер', 'техника на воздушной подушке, парящая над бренным миром.')
    let drive_legs = subSkill(drive, 'Шагатель', 'с ногами, для особо сложной местности.')

    let navigation = new Skill('Навигация', 'int', 'Навигация вступает в дело, когда ты хочешь воспользоваться картами, техническими данными, словесными описаниями или ориентирами на местности, чтобы проложить курс и не заблудиться.')
    let navigation_land = subSkill(navigation, 'Наземная', 'ориентирование на поверхности планет при помощи логи-компасов, карт и познаний в географии.')
    let navigation_space = subSkill(navigation, 'Космическая', 'направить корабль от планеты к планете при помощи звёздных атласов и картомантических ритуалов.')

    let performer = new Skill('Исполнитель', 'cha', 'Используй это Умение, чтобы развлекать и покорять жаждущую зрелищ толпу.')
    let performer_signer = subSkill(performer, 'Певец')
    let performer_dancer = subSkill(performer, 'Танцор')
    let performer_musician = subSkill(performer, 'Музыкант')
    let performer_storyteller = subSkill(performer, 'Сказитель')

    let pilot = new Skill('Пилотирование', 'dex', 'Пилотирование корабля в обычных условиях не требует Прохождения Тестов, но они могут понадобиться при полётах в сложных условиях – при штормовом ветре, на предельной скорости и для выполнения иных опасных маневров.')
    let pilot_civil = subSkill(pilot, 'Гражданские суда', 'челноки')
    let pilot_military = subSkill(pilot, 'Гражданские суда', 'авиация Астра Милитарум')
    let pilot_space = subSkill(pilot, 'Гражданские суда', 'управление космическими кораблями')
    
    let language = new Skill(
        'Язык',
        'int',
    )
    let language_gothic_low = subSkill(language, "Низкий Готик", 'Всеобщий язык Империума.')
    let language_gothic_high = subSkill(language, "Высокий Готик", 'Язык нобилитета, правовых структур и литургий Экклезиархии.')
    let language_hive = subSkill(language, "диалект улья", 'Опошленная версия Низкого Готика, уникальная для каждого отдельного улья.')
    let language_ship = subSkill(language, "корабельный арго", 'Коды, сленг и идиоматика, уникальные для каждого отдельного судна.')
    let language_tribal = subSkill(language, "племенной диалект", 'Грубый и простой язык, на котором говорят дикари примитивных миров.')
    let language_local_dusk = subSkill(language, "диалект Даска", '')
    let language_local_gunmetal = subSkill(language, "диалект города Ганметал", '')
    let language_local_volg = subSkill(language, "диалект Вольга", '')
    let language_local_fleet = subSkill(language, "флотский арго", 'Коды, сленг и идиоматика линейного флота.')

    let language_secret = new Skill(
        'Тайный язык',
        'int',
        'Тайный Язык – особый язык, знают и понимают который лишь люди определённой профессии, представители какой-либо одной организации, рода занятий или общественного класса.',
    )
    let language_secret_techno = subSkill(language_secret, 'Техно', 'сплав жаргонизмов, бинарного кода и, в некоторых случаях, высоко- или низкочастотных звуковых каденций.')
    let language_secret_moritat = subSkill(language_secret, 'Моритат', '')
    let language_secret_any = subSkill(language_secret, '          ', 'некий тайный язык некой совсем не тайной организации.')

    let lore_common = new Skill(
        'Обыденное знание',
        'int',
        'Набор воспоминаний о привычках, структуре, традициях, знаменитых деятелях и суевериях, относящихся к отдельным мирам, культурным группам и организациям.',
    )
    let lore_common_imperium = subSkill(lore_common, 'Империум', 'Знание о секторах, сегментумах и наиболее известных мирах Империума.')
    let lore_common_adeptus_arbitres = subSkill(lore_common, 'Адептус Арбитрес', 'Знание о различных орденах и сектах Арбитрес, включая нюансы типа структур субординации и основ прохождения стандартных процедур.')
    let lore_common_administratum = subSkill(lore_common, 'Администратум', 'Поверхностное знание внутренних дел, правил и порядков Администратума.')
    let lore_common_crime = subSkill(lore_common, 'Преступность', 'Знание об организованных преступных и диссидентских сообществах Империума.')
    let lore_common_dusk = subSkill(lore_common, 'Фольклор Даска')
    let lore_common_ecclesiarchy = subSkill(lore_common, 'Экклезиархия', 'Понимание иерархии Культа Императора, его системы санов, приветствий и общих практик.')
    let lore_common_imperial_credo = subSkill(lore_common, 'Имперское Кредо', 'Знание ритуалов и практик Имперского Культа, самых распространённых обрядов почитания Императора и прославленных святых.')
    let lore_common_imperial_guard = subSkill(lore_common, 'Имперская Гвардия', 'Основная информация, касающаяся системы званий, логистики и структуры Имперской Гвардии, а также их основных тактических и стратегических доктрин.')
    let lore_common_mechanicus = subSkill(lore_common, 'Культ Машины', 'Общее понимание символики и практик Механикума, включая знание ступеней их иерархии и характерных для них формальных приветствий.')
    let lore_common_technology = subSkill(lore_common, 'Технология', 'Знание простейших литаний и ритуалов пробуждения и умиротворения духов машин.')
    let lore_common_war = subSkill(lore_common, 'Война', 'Знания о великих битвах, славных (и бесславных) военачальниках и героях, а также знаменитых стратегмах.')
    let lore_common_commerce = subSkill(lore_common, 'Коммерция', '')

    let lore_forbidden = new Skill(
        'Запретное знание',
        'int',
        'К запретному знанию относится опасное и, зачастую, еретическое знание, которое Аколит может почерпнуть из мириадов опасных и непредсказуемых источников, время от времени попадающих к нему в руки.',
    )
    let lore_forbidden_archeotech = subSkill(lore_forbidden, 'Археотех', 'Знание о чудесных машинах древности, а также обладание фрагментарной информацией об их функциях и предназначении.')
    let lore_forbidden_black_library = subSkill(lore_forbidden, 'Чёрная библиотека', 'Тайные познания о Чёрной Библиотеке, её запретном содержимом, странных механизмах и невообразимых бледных, безволосых существах, что непрестанно трудятся внутри её стен.')
    let lore_forbidden_cults = subSkill(lore_forbidden, 'Культы', 'Знание самых распространённых Имперских Культов, их сект и отколовшихся от них кабалов.')
    let lore_forbidden_demonology = subSkill(lore_forbidden, "Демонология", 'Жуткое знание о немногих описанных варп-сущностях и различных их манифестациях.')
    let lore_forbidden_heresy = subSkill(lore_forbidden, 'Ересь', 'Знание богомерзких практик и верований, объявленных в Империуме еретическими.')
    let lore_forbidden_inquisition = subSkill(lore_forbidden, 'Инквизиция', 'Общая информация (часто основанная лишь на слухах) о самой ужасной и самой загадочной из организаций человечества – Инквизиции.')
    let lore_forbidden_mutants = subSkill(lore_forbidden, 'Мутанты', 'Информация о стабильных и нестабильных мутациях, а также об их наиболее печально известных последствиях.')
    let lore_forbidden_omnissiah = subSkill(lore_forbidden, "Адептус Механикус", 'Понимание философской базы убеждений и верований различных организаций и сект последователей Бога-Машины.')
    let lore_forbidden_psy = subSkill(lore_forbidden, 'Псайкеры', 'Умение распознавать признаки псайкеров, результаты применения их способностей и пределы доступных им сил.')
    let lore_forbidden_warp = subSkill(lore_forbidden, 'Варп', 'Понимание путей варпа, последствий его взаимодействия с реальным космосом, и влияния его пертурбаций на межзвёздные путешествия.')
    let lore_forbidden_xenos = subSkill(lore_forbidden, 'Ксеносы', 'Знание о наиболее распространённых видах ксеносов.')
    // let lore_forbidden_orda = subSkill(lore_forbidden, 'Ордосы', 'Охватывает более специализированную информацию об одном из Великих Ордосов Инквизиции: Маллеус, Еретикус или Ксенос.') // TODO: split?
    let lore_forbidden_any = subSkill(lore_forbidden, '          ', 'Любое запретное знание на любой извращённый вкус.')

    let lore_scholastic = new Skill(
        'Учёное знание',
        'int',
        'Система знаний в определенной научной сфере. Учёное Знание достаётся ценой самоотверженного изучения предмета, а в вопросах объема и системности находится далеко за пределами сфер, очерченных рамками Обыденного Знания.',
    )
    let lore_scholastic_beasts = subSkill(lore_scholastic, 'Звери', 'Понимание классификации животных и знакомство с особенностями множества неразумных созданий.')
    let lore_scholastic_crypto = subSkill(lore_scholastic, 'Криптология', 'Понимание механизма действия кодов, шифров, тайных языков и цифровых ключей.')
    let lore_scholastic_legends = subSkill(lore_scholastic, 'Легенды', 'Знание величайших историй прошлого, таких как жуткая Ересь Хоруса или Тёмная Эра Технологии.')
    let lore_scholastic_numerology = subSkill(lore_scholastic, 'Нумерология', 'Понимание мистических свойств чисел – от Теории Катастроф до Садлейрианской литании.')
    let lore_scholastic_occult = subSkill(lore_scholastic, 'Оккультизм', 'Понимание оккультных ритуалов, теорий и суеверий, а также знание о применении и мистическом значении оккультных атрибутов.')
    let lore_scholastic_tactics = subSkill(lore_scholastic, 'Тактика Империалис', 'Обучение основам Тактики Империалис, а также иным военным теориям, способам размещения войск и боевым стратегмам.')
    let lore_scholastic_any = subSkill(lore_scholastic, '          ', 'Любое учёное знание на любой пытливый ум.')

    let trade_cook = new Skill(
        'Ремесло (Повар)',
        'int',
        'Это умение можно сочетать со Стойкостью, Химией и Ремеслом (Аптекарий), чтобы придавать напиткам и лекарствам более приятный вкус, или чтобы вкус еды или напитка маскировал присутствие посторонних веществ.',
    )
    let trade_copyist = new Skill(
        'Ремесло (Переписчик)',
        'int',
        'Переписчик в 41-м Тысячелетии – гораздо больше, нежели бездумный писарь, скребущий электропером по дата пергаменту. Способный, конечно же, выполнять и такую работу, мастерпереписчик может создавать прекрасные иллюстрированные манускрипты на любую тему, от разлапистых генеалогических древ до эпических баллад.',
    )
    let trade_merchant = new Skill(
        'Ремесло (Купец)',
        'cha',
        'В то время как Бартер – это умение совершать непосредственные, прямые сделки, Ремесло (Купец) представляет собой собрание навыков ведения стратегических операций, заключения долговременных договоров, необходимых не только для того, чтобы завершить эту сделку, но в первую очередь обеспечить наличие следующей сделки.',
    )
    let trade_scrimshawer = new Skill(
        'Ремесло (Резчик)',
        'dex',
        'Мастера этого ремесла обладают умением наносить изображения и текст на кость при помощи иглы и чернил, способом, напоминающим татуировку. Тем не менее, это Ремесло имеет более широкое применение, позволяющее наносить перманентные изображения почти на любой материал при помощи чернил и кислот, подходящих для выбранных поверхностей.',
    )
    let trade_soothsayer = new Skill(
        'Ремесло (Предсказатель)',
        'cha',
        'Гадатели – наблюдательные и проницательные профессионалы, способные совместить мельчайшие крохи информации о человеке и составить, исходя из них, в точности то, что желает услышать клиент.',
    )
    let trade_valet = new Skill(
        'Ремесло (Лакей)',
        'cha',
        'Ты обладаешь даром предугадывать хозяйственные и личные потребности других людей, а также умением управлять удовлетворением этих нужд. Людей, изучивших это ремесло, называют мажордомами или камердинерами.',
    )
    return {
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
        'ciphers_secret_society_hetairea': ciphers_secret_society_hetairea,
        'ciphers_secret_society_sollex': ciphers_secret_society_sollex,
        'ciphers_blades': ciphers_blades,
        'ciphers_maligris': ciphers_maligris,
        'climb': climb,
        'command': command,
        'concealment': concealment,
        'contortionist': contortionist,
        'deceive': deceive,
        'demolition': demolition,
        'disguise': disguise,
        'dodge': dodge,
        'evaluate': evaluate,
        'gamble': gamble,
        'inquiry': inquiry,
        'interrogation': interrogation,
        'intimidate': intimidate,
        'invocation': invocation,
        'literacy': literacy,
        'logic': logic,
        'psyniscience': psyniscience,
        'security': security,
        'scrutiny': scrutiny,
        'search': search,
        'silent_move': silent_move,
        'shadowing': shadowing,
        'swim': swim,
        'survival': survival,
        'techuse': techuse,
        'track': track,
        'drive_land': drive_land,
        'drive_hover': drive_hover,
        'drive_legs': drive_legs,
        'navigation_land': navigation_land,
        'navigation_space': navigation_space,
        'performer_signer': performer_signer,
        'performer_dancer': performer_dancer,
        'performer_musician': performer_musician,
        'performer_storyteller': performer_storyteller,
        'pilot_civil': pilot_civil,
        'pilot_military': pilot_military,
        'pilot_space': pilot_space,
        'language_gothic_low': language_gothic_low,
        'language_gothic_high': language_gothic_high,
        'language_hive': language_hive,
        'language_ship': language_ship,
        'language_tribal': language_tribal,
        'language_local_dusk': language_local_dusk,
        'language_local_gunmetal': language_local_gunmetal,
        'language_local_volg': language_local_volg,
        'language_local_fleet': language_local_fleet,
        'language_secret_any': language_secret_any,
        'language_secret_moritat': language_secret_moritat,
        'language_secret_techno': language_secret_techno,
        'lore_forbidden_archeotech': lore_forbidden_archeotech,
        'lore_forbidden_black_library': lore_forbidden_black_library,
        'lore_forbidden_cults': lore_forbidden_cults,
        'lore_forbidden_demonology': lore_forbidden_demonology,
        'lore_forbidden_heresy': lore_forbidden_heresy,
        'lore_forbidden_inquisition': lore_forbidden_inquisition,
        'lore_forbidden_mutants': lore_forbidden_mutants,
        'lore_forbidden_omnissiah': lore_forbidden_omnissiah,
        'lore_forbidden_psy': lore_forbidden_psy,
        'lore_forbidden_warp': lore_forbidden_warp,
        'lore_forbidden_xenos': lore_forbidden_xenos,
        'lore_forbidden_any': lore_forbidden_any,
        'lore_scholastic_beasts': lore_scholastic_beasts,
        'lore_scholastic_crypto': lore_scholastic_crypto,
        'lore_scholastic_legends': lore_scholastic_legends,
        'lore_scholastic_numerology': lore_scholastic_numerology,
        'lore_scholastic_occult': lore_scholastic_occult,
        'lore_scholastic_tactics': lore_scholastic_tactics,
        'lore_scholastic_any': lore_scholastic_any,
        'lore_common_imperium': lore_common_imperium,
        'lore_common_adeptus_arbitres': lore_common_adeptus_arbitres,
        'lore_common_administratum': lore_common_administratum,
        'lore_common_crime': lore_common_crime,
        'lore_common_dusk': lore_common_dusk,
        'lore_common_ecclesiarchy': lore_common_ecclesiarchy,
        'lore_common_imperial_credo': lore_common_imperial_credo,
        'lore_common_imperial_guard': lore_common_imperial_guard,
        'lore_common_mechanicus': lore_common_mechanicus,
        'lore_common_technology': lore_common_technology,
        'lore_common_commerce': lore_common_commerce,
        'lore_common_war': lore_common_war,
        'trade_cook': trade_cook,
        'trade_copyist': trade_copyist,
        'trade_merchant': trade_merchant,
        'trade_soothsayer': trade_soothsayer,
        'trade_scrimshawer': trade_scrimshawer,
        'trade_valet': trade_valet,
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
let sound_constitution = new Talent('Крепкое телосложение', 'Ты способен пережить больше повреждений, прежде чем умрёшь. Получаешь дополнительную Рану.')
let ambidexter = new Talent(
    "Амбидекстрия", 
    "Ты можешь пользоваться одинаковохорошо обеими руками. Ты не получаешь обычного штрафа -20 за атаку неосновной рукой. Если ты обладаешь Талантом Две Руки, штраф за атаку с двух рук падает до -10.",
    new Requirement(new Stats().copy({ dex: 30 })),
)
let chem_geld = new Talent(
    'Химическое оскопление',
    'Некоторые химические и хирургические процедуры сделали тебя глухим к искушениям плоти.',
)

let psy_talents = function () {
    let minor_psy_power = new Talent(
        'Малая психосила',
    )
    let psy_rank_1 = new Talent(
        'Пси-рейтинг 1',
        'Ты раскрыл свой дар обращения с Психосилами.',
    )
    return {
        'minor_psy_power': minor_psy_power,
        'psy_rank_1': psy_rank_1,
    }
}()

let talents = function () {
    let hatred = new Talent(
        'Ненависть',
        'У тебя есть повод ненавидеть $$, и твоя злость делает тебя сильнее. Сражаясь против $$ ты получаешь бонус +10 ко всем Тестам Ближнего Боя.'
    )
    let heightened_senses = new Talent(
        'Обострённые чувства',
        'У тебя $$ значительно лучше среднего. Теперь ты будешь получать бонус +10 к любому Тесту, включающему $$.',
    )
    let peer = new Talent(
        'Равный',
        'Ты знаешь, как вести себя с $$. Ты получаешь бонус +10 ко всем Тестам Товарищества при взаимодействии с ними.',
        new Requirement(new Stats().copy({ cha: 30 })),
    )
    let resistance = new Talent(
        'Сопротивляемость',
        'В силу привычки ли, интенсивных ли методик закаливания, или просто благодаря удачному стечению генетических обстоятельств, но ты легче переносишь $$. Ты получаешь бонус +10 при попытках избежать любых неблагоприятных эффектов',
    )
    let talented = new Talent(
        'Одарённый',
        'Ты получаешь бонус +10 к Тестам умения $$.'
    )
    let weapon_hand = new Talent(
        'Пистолеты',
        'Ты прошел курс подготовки в обращении с $$пистолетами и теперь можешь пользоваться ими без штрафов.',
    )
    let weapon_main = new Talent(
        'Основное оружие',
        'Ты прошел курс подготовки в обращении с оружием ($$) и теперь можешь пользоваться ими без штрафов.',
    )
    let weapon_melee = new Talent(
        'Рукопашное оружие',
        'Ты прошел курс подготовки в обращении с рукопашным оружием ($$) и теперь можешь пользоваться ими без штрафов.',
    )
    let weapon_throw = new Talent(
        'Метательное оружие',
        'Ты прошел курс подготовки в обращении с метательным оружием ($$) и теперь можешь пользоваться ими без штрафов.'
    )
    return {
        // wild world talents
        iron_guts: new Talent("Железное нутро"),
        savage: new Talent("Дикарь"),
        init_rites: new Talent("Ритуалы инициации"),
        nothing_more_to_fear: new Talent("Нечего больше бояться"),
        // forge world talent
        cult_outsider: new Talent(
            'Чуждый Культу',
            'Персонаж получает штраф -10 на все Тесты, включающие знание Имперского Кредо и штраф -5 на Тесты Товарищества при взаимодействии с членами Экклезиархии в формальной обстановке.',
        ),
        // hive world talents
        crowd_ok: new Talent(
            'Привычка к толпе',
            'Для жителей ульев плотные толпы народа не считаются Сложным Ландшафтом.',
        ),
        hive_addict: new Talent(
            'Повязанный с ульем',
            'Находясь в «неправильном месте» (т.е. месте, лишенном благ промышленного производства, крепких потолков и электроэнергии), уроженцы ульев получают штраф -10 ко всем тестам на Выживание (Инт) и штраф -5 к тестам на Интеллект.',
        ),
        caoutious: new Talent(
            'Осторожный',
            'Жители ульев постоянно настороже, и всегда готовы отреагировать на первые признаки неприятностей. Все уроженцы ульев получают +1 к Инициативе.',
        ),
        iron_loaded: new Talent(
            'Упакован железом',
            'Если ты по какой-либо причине остался без рабочего оружия, неважно, разоружили тебя, застали врасплох или у тебя просто кончились патроны, ты получаешь штраф -5 на все Тесты.',
        ),
        path_of_weapon: new Talent(
            'Путь оружия',
            'Ты получаешь бонус +5 к Тестам на Технологию, когда дело касается пулевого оружия.',
        ),
        // imperial world talents
        blissful_ignorance: new Talent(
            'Блаженное неведение',
            'Твоя мудрая слепота накладывает штраф -5 на все Тесты Запретного Знания.',
        ),
        desert_world: new Talent(
            'Пустынный мир',
            'Ты получаешь штраф -5 на все Тесты Восприятия, связанные со зрением',
        ),
        // voidborn talents
        lucky: new Talent(
            'Заговорённый',
            'Каждый раз, когда ты тратишь (но не сжигаешь) Очко Судьбы, брось 1d10. Если выпадает 9, это Очко тут же возвращается к тебе.',
        ),
        evil_eye: new Talent(
            'Дурной глаз',
            'Ты получаешь штраф -5 на все Тесты Товарищества с участием людей не из числа пустотников.',
        ),
        space_ok: new Talent(
            'Привычка к Пустоте',
            'Ты получаешь иммунитет к «космической болезни», а нулевая или пониженная гравитация не является для тебя Сложным Ландшафтом.',
        ),
        boarder: new Talent(
            'Абордажник',
            'Если ты сражаешься, стоя спиной к стене, или в тесном пространстве, ты получаешь бонус +5 на все Тесты Ближнего Боя. Однако сражения «на грязи» тебе непривычны, так что ты получаешь -1 к Инициативе, сражаясь на открытой местности на поверхности планеты. Вдобавок ты получаешь дополнительный штраф -10 к Тестам на Баллистик, если стреляешь из дистанционного оружия на Дальнюю Дистанцию или дальше.',
        ),
        officer: new Talent(
            'Офицер на палубе',
            'Ты получаешь +10 к Тестам Командования, пребывая на борту космического корабля. Кроме того, все Тесты Товарищества при общении с другими пустотниками получают бонус +5.',
        ),
        // purified talents
        fuse: new Talent(
            'Предохранитель',
            'Всем Очищенным агентам Инквизиции имплантируют в мозг предохранительный триггер. Триггер работает в точности как использование психосилы Доминирование.',
        ),
        imperial_training: new Talent(
            'Имперская подготовка',
            'Ты получаешь бонус +10 к Тестам Силы Воли, сделанным при сопротивлении Страху и попыткам взять твой разум под контроль.',
        ),
        through_dark_mirror: new Talent(
            'Сквозь тёмное зеркало',
            'Определённые редкие события, люди или даже фразы, образы и запахи могут запустить «подавленные» воспоминания.',
        ),
        // noble
        peer_noble_special: subTalent(peer, '          ', 'теми, на ком зиждется могущество твоей семьи.'), // &nbsp;s
        etiquette: new Talent(
            'Этикет',
            'Ты получаешь бонус +10 к Тестам на Обольщение, Обман и Проницательность в формальных ситуациях и при взаимодействии с представителями правящих сословий.',
        ),
        vendetta: new Talent(
            'Вендетта',
            'У тебя есть враги: возможно, благородный дом или иная могущественная группа.',
        ),
        // schola
        hardened_will: new Talent(
            'Закалённая воля',
            'Когда ты проходишь Очень Тяжёлый (-30) Тест на Силу Воли вместо стандартного штрафа ты получаешь всего -20.',
        ),
        scholast: new Talent(
            'Воспитание в отрешении',
            'Ты получаешь штраф -10 на все Тесты Обольщения, Командования, Обмана и Проницательности, когда имеешь дело с худшими представителями общества.',
        ),
        // tech priest
        electrowire: new Talent(
            'Электропривой',
            'Способность использовать электрический привой для доступа к портам данных и общения с духами машин.',
        ),
        // sollex
        divine_light: new Talent(
            'Божественный Свет',
            '+10 к Тестам Технологии при работе с лазерными или голографическими устройствами.',
        ),

        // normal
        binary_chatter: new Talent(
            'Бинарный диалог',
            'Ты получаешь бонус +10 на все попытки инструктировать, программировать или добывать информацию из сервиторов.',
        ),
        catfall: new Talent(
            'Мягкое падение',
            'Ты проворен и гибок словно кот, и способен без вреда для себя падать и прыгать с гораздо большей высоты, чем прочие люди.',
            new Requirement(new Stats().copy({ dex: 30 })),
        ),
        concealed_cavity: new Talent(
            'Скрытая полость',
            'В твоём теле есть небольшая потайная полость. В этой полости ты можешь хранить один небольшой предмет размером не более ладони.',
        ),
        dark_soul: new Talent(
            'Тёмная душа',
            'Твоя душа запятнана тьмой, поглощающей часть эффектов Порчи. Каждый раз, когда ты проходишь Тест на Осквернение, обычные штрафы на этот Тест уменьшаются вдвое.',
        ),
        feedback_screech: new Talent(
            'Акустический резонанс',
            'Пробормотав себе под нос алогичную формулу, ты способен вызвать возмущение в контурах своего вокс-синтезатора. Динамики отзываются на этот протест взрывом резкого скрипящего воя, в равной степени шокирующего и отвлекающего окружающих.',
            new Requirement(new Stats(), [], new Set(['Техножрец'])),
        ),
        flagellant: new Talent(
            'Флагеллант',
            'Ты поставил свою боль на службу Императору. Каждый день ты обязан проводить 20 минут в молитвах и умерщвлении плоти, в процессе нанося самому себе 1 очко Урона. Ты не должен ни лечить этот Урон, ни позволять кому бы то ни было лечить его.',
        ),
        insanely_faithful: new Talent(
            'Исступлённая вера',
            'В своём безумии ты находишь тихую гавань. При определении эффектов Шока ты можешь кинуть кости дважды и выбрать лучший результат.',
        ),
        jaded: new Talent(
            'Пресыщенный',
            'Ты видел худшее из того, на что способна галактика, и, так сказать, акклиматизировался к худшим кошмарам этого безумного мира.',
            new Requirement(new Stats().copy({ wil: 30 }))
        ),
        light_sleeper: new Talent(
            'Чуткий сон',
            'У тебя очень чуткий сон, и ты остаёшься настороже, даже когда крепко спишь – с точки зрения Внезапности, Тестов Бдительности или при поспешном пробуждении, считается, что ты бодрствуешь.',
            new Requirement(new Stats().copy({ per: 30 })),
        ),
        meditation: new Talent(
            'Медитация',
            'Умиротворив свое сознание и войдя в транс, ты можешь излечивать немощь своего тела.',
        ),
        paranoia: new Talent(
            'Паранойя',
            'Ты всегда настороже, всегда в поисках сокрытых опасностей и точно знаешь, что вся галактика тайно ополчилась на тебя. Ты получаешь +2 к броскам Инициативы.',
        ),
        quick_draw: new Talent(
            'Быстрое выхватывание',
            'Ты столь быстр, что готовое к бою оружие в твоей руке способно появиться буквально в мгновение ока.',
        ),
        rapid_reload: new Talent(
            'Быстрая перезарядка',
            'Ты провел много времени, упражняясь с оружием, и теперь можешь перезаряжать его практически мгновенно.',
        ),
        sprint: new Talent(
            'Спринт',
            'При совершении Полного Действия Передвижения, ты можешь дополнительно пройти расстояние, равное твоему Бонусу Ловкости в метрах.',
        ),
        technical_knock: new Talent(
            'Ритуал Освобождения',
            'Ты способен снять заклинивание с любого оружия в качестве Частичного Действия. Для совершения ритуала ты должен прикасаться к этому оружию.',
            new Requirement(new Stats().copy({ int: 30 }))
        ),
        unremarcable: new Talent(
            "Непримечательный",
            'Твое лицо не задерживается в памяти, что помогает тебе слиться с толпой.',
        ),
        unshakeable_faith: new Talent(
            'Неколебимая вера',
            'Вера в Императора столь сильна в тебе, что ты не боишься ступить навстречу любой опасности.',
        ),
        street_fighter: new Talent(
            'Уличный боец',
            'Ты мастер грязных приёмов, вроде ударов ниже пояса или ножом в брюхо. При нанесении Критического Урона при помощи ножей или безоружной атаки ты получаешь +2 к Урону.',
        ),

        // groups
        hatred_demons: subTalent(hatred, 'Демоны', 'демонов'),
        hatred_mutants: subTalent(hatred, 'Мутанты', 'мутантов'),
        hatred_witches: subTalent(hatred, 'Ведьмы', 'ведьм'),
        hatred_tech_heresy: subTalent(hatred, 'Техноересь', 'техноересь'),

        heightened_senses_eyes: subTalent(heightened_senses, 'Зрение', 'зрение'),
        heightened_senses_hear: subTalent(heightened_senses, 'Слух', 'слух'),
        heightened_senses_smell: subTalent(heightened_senses, 'Обоняние', 'нюх'),
        heightened_senses_taste: subTalent(heightened_senses, 'Вкус', 'вкусовые рецепторы'),
        heightened_senses_skin: subTalent(heightened_senses, 'Осязание', 'осязание'),

        peer_academia: subTalent(peer, 'Академики', 'академиками'),
        peer_adeptus_arbitres: subTalent(peer, 'Адептус Арбитрес', 'арбитрами'),
        peer_tech: subTalent(peer, 'Адептус Механикус', 'техножрецами'),
        peer_administratum: subTalent(peer, 'Администратум', 'чиновниками'),
        peer_astropath: subTalent(peer, 'Астропаты', 'астропатами'),
        peer_ecclisearchy: subTalent(peer, 'Экклезиархия', 'священством'),
        peer_wild: subTalent(peer, 'Дикари', 'дикарями'),
        peer_government: subTalent(peer, 'Правительство', 'управляющими'),
        peer_hive_locals: subTalent(peer, 'Жители ульев', 'жителями ульев'),
        peer_inquisition: subTalent(peer, 'Инквизиция', 'инквизиторами (и не только)'),
        peer_middle_class: subTalent(peer, 'Средний класс', 'средним классом'),
        peer_military: subTalent(peer, 'Военные', 'военными'),
        peer_noble: subTalent(peer, 'Нобилитет', 'благородными'),
        peer_mad: subTalent(peer, 'Безумцы', 'безумцами'),
        peer_criminal: subTalent(peer, 'Преступники', 'криминалом'),
        peer_voidborn: subTalent(peer, 'Пустотники', 'пестотниками'),
        peer_workers: subTalent(peer, 'Рабочие', 'трудягами'),

        resistance_cold: subTalent(resistance, 'Холод', 'холод'),
        resistance_heat: subTalent(resistance, 'Жара', 'жару'),
        resistance_psy: subTalent(resistance, 'Психосилы', 'пси воздействие'),

        ...(function () {
            let res = {}
            for (let s of Object.keys(skills)) {
                res[s] = subTalent(talented, s, s)
            }
            return res
        }()),

        // weapon
        weapon_throw_prim: subTalent(weapon_throw, 'прим'),
        weapon_cqc_prim: subTalent(weapon_melee, 'прим'),
        weapon_cqc_chain: subTalent(weapon_melee, 'цеп'),
        weapon_cqc_shock: subTalent(weapon_melee, 'шок'),
        weapon_hand_prim: subTalent(weapon_hand, 'прим'),
        weapon_hand_laz: subTalent(weapon_hand, 'лаз'),
        weapon_hand_stub: subTalent(weapon_hand, 'стаб'),
        weapon_main_prim: subTalent(weapon_main, 'прим'),
        weapon_main_laz: subTalent(weapon_main, 'лаз'),
        weapon_main_stub: subTalent(weapon_main, 'стаб'),
        weapon_main_fire: subTalent(weapon_main, 'огонь'),

        // special
        'sound_constitution': sound_constitution,
        'ambidexter': ambidexter,
        'chem_geld': chem_geld,

        // psy
        ...psy_talents,
    }
}()

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

let sanctionationSideEffects = [
    new RollableOption(
        new SanctionationSideEffect(
            'Реконструированный череп',
            'Какая-то часть твоих испытаний расколола тебе череп. Твой череп скреплён металлическими пластинами, некоторые из которых отчётливо видны.',
            new PsyMod(new Stats().copy({ int: -3 })),
        ),
        1, 8,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Загнанный',
            'Видения, навещавшие тебя во время санкционирования, развили у тебя лёгкую паранойю. Ты убежден, что некие части твоей души, отсеченные во время испытаний, обрели разум и теперь пытаются выследить тебя. Хотя ты и сам понимаешь, что это, по меньшей мере, глупо, ты, тем не менее, отказываешься садиться спиной к двери, просто на всякий случай.',
            new PsyMod(new Stats(), new SecondaryMods(idf, idf, x => x + d10())),
        ),
        9, 14,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Неприятные воспоминания',
            'Твое становление было таким, что ты непроизвольно вздрагиваешь и кривишься, когда кто-нибудь упоминает Святую Терру.',
            new PsyMod(new Stats(), new SecondaryMods(idf, idf, x => x + d5())),
        ),
        15, 25,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Ужас, ужас',
            'Твои волосы поседели, ты иногда бормочешь себе под нос, а каждая ночь встречает тебя очередным кошмарным сновидением.',
            new PsyMod(new Stats(), new SecondaryMods(idf, idf, x => x + d5())),
        ),
        26, 35,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Боль нервной индукции',
            'Кожа на тыльной стороне твоей правой кисти обезображена шрамами. Ты чувствуешь дискомфорт, находясь рядом с лысыми женщинами в робах.',
        ),
        36, 42,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Стоматологическое Зондирование',
            'У тебя во рту больше нет зубов. У тебя есть полный набор резных протезов, выполненных из зубов почивших пилигримов.',
        ),
        43, 49,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Оптический обрыв',
            'Твои ритуалы становления оказали разрушительный эффект на твои глаза. Они были удалены и заменены кибернетическими сенсорами Обычного качества.',
        ),
        50, 57,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Благочестивые вопли',
            'Твои разрушенные голосовые связки были заменены вокс-индуктором. Этот имплантат размером с большой палец чуть выступает из плоти твоего горла.',
        ),
        58, 63,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Облучение',
            'Ты узрел истинную силу Золотого Трона. На всей поверхности твоего тела нет ни единого волоска.',
        ),
        64, 70,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Скованный язык',
            'Твои губы, десны и нёбо татуированы гексаграмматическими печатями. Ты должен пройти Тяжёлый (-20) Тест Силы Воли чтобы суметь произнести имена Губителей (Кхорна, Тзинча, Слаанеш и Нургла). Плюс, ты жутко заикаешься, если говоришь о демонах.',
        ),
        71, 75,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Обручение с Троном',
            'Ты хранишь верность лишь Императору. Ты получаешь Химическое Оскопление и кольцо из чатталиума, которое стоит около 100 Тронов.',
            new PsyMod(new Stats(), new SecondaryMods(), [talents.chem_geld]),
        ),
        76, 88,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Ведьмины колючки',
            'Твое тело покрыто тысячами мелких шрамов. У тебя стойкая неприязнь к иголкам.',
            new PsyMod(new Stats().copy({ con: +3 })),
        ),
        89, 94,
    ),
    new RollableOption(
        new SanctionationSideEffect(
            'Гипнотическое наставление',
            'Могучее внушение заставляет тебя шёпотом бормотать Литанию Защиты, даже когда ты спишь или находишься без сознания.',
            new PsyMod(new Stats().copy({ wil: +3 })),
        ),
        95, 100,
    ),
]

/* Профы состоят из
 *
 *  - Название
 *  - Схема прокачки статов
 *  - Умений (в случае или-или — помести в [список])
 *  - Талантов (в случае или-или — помести в [список])
 *  - Схема рангов
 */

let profs = {
    adept: new Prof(
        'Адепт',
        new StatUpgrades(
            sud.hard,
            sud.med,
            sud.hard,
            sud.hard,
            sud.med,
            sud.main,
            sud.fast,
            sud.fast,
            sud.med,
        ),
        [
            skills.language_gothic_low,
            skills.literacy,
            [skills.lore_scholastic_legends, skills.lore_common_technology],
            skills.lore_common_imperium,
            [skills.trade_copyist, skills.trade_valet],
        ],
        [
            [talents.weapon_cqc_prim, talents.weapon_hand_stub],
            [talents.light_sleeper, talents.resistance_cold],
            [talents.sprint, talents.unremarcable],
        ],
        [
            new Rank(
                'Архивист',
                0,
                [
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.drive_hover, 1, 100),
                    new UpS(skills.pilot_civil, 1, 100),
                    new UpS(skills.literacy, 1, 100),
                    new UpS(skills.lore_common_imperium, 1, 100),
                    new UpS(skills.lore_common_technology, 1, 100),
                    new UpS(skills.lore_scholastic_legends, 1, 100),
                    new UpS(skills.trade_cook, 1, 100),
                    new UpS(skills.trade_copyist, 1, 100),
                    new UpS(skills.trade_valet, 1, 100),
                    new UpS(skills.swim, 1, 200),
                ],
                [
                    new UpT(talents.resistance_cold, 100),
                    new UpT(talents.light_sleeper, 100),
                    new UpT(talents.unremarcable, 100),
                    new UpT(talents.sprint, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.weapon_cqc_prim, 200),
                    new UpT(talents.weapon_hand_prim, 200),
                    new UpT(talents.weapon_hand_laz, 200),
                    new UpT(talents.weapon_hand_stub, 200),
                    new UpT(talents.weapon_throw_prim, 200),
                ]
            ),
        ]
    ),
    judge: new Prof(
        'Арбитр',
        new StatUpgrades(
            sud.med,
            sud.fast,
            sud.hard,
            sud.main,
            sud.hard,
            sud.fast,
            sud.med,
            sud.med,
            sud.med,
        ),
        [
            skills.language_gothic_low,
            skills.literacy,
            skills.lore_common_adeptus_arbitres,
            skills.lore_common_imperium,
            skills.inquiry,
        ],
        [
            talents.weapon_main_stub,
            talents.weapon_cqc_prim,
            [talents.quick_draw, talents.rapid_reload],
        ],
        [
            new Rank(
                "Патрульный",
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.lore_common_adeptus_arbitres, 1, 100),
                    new UpS(skills.lore_common_adeptus_arbitres, 2, 100),
                    new UpS(skills.lore_common_imperium, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.drive_hover, 1, 100),
                    new UpS(skills.inquiry, 1, 100),
                    new UpS(skills.inquiry, 2, 100),
                    new UpS(skills.scrutiny, 1, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.literacy, 1, 100),
                ],
                [
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_main_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_throw_prim, 100),
                    new UpT(talents.quick_draw, 100),
                    new UpT(talents.rapid_reload, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                ],
            ),
        ],
    ),
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
            [talents.weapon_throw_prim, talents.weapon_hand_laz],
            talents.weapon_main_stub,
            talents.weapon_hand_stub,
        ],
        [
            new Rank(
                "Наёмник",
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.climb, 1, 100),
                    new UpS(skills.dodge, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.inquiry, 1, 100),
                    new UpS(skills.pilot_civil, 1, 100),
                    new UpS(skills.silent_move, 1, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.literacy, 1, 200),
                ],
                [
                    new UpT(talents.weapon_main_laz, 100),
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_main_stub, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.weapon_throw_prim, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.catfall, 100),
                    new UpT(talents.ambidexter, 100),
                    new UpT(talents.unremarcable, 100),
                    new UpT(talents.heightened_senses_eyes, 100),
                ],
            ),
        ],
    ),
    cleric: new Prof(
        'Клирик',
        new StatUpgrades(
            sud.med,
            sud.fast,
            sud.med,
            sud.med,
            sud.med,
            sud.med,
            sud.med,
            sud.fast,
            sud.fast,
        ),
        [
            skills.language_gothic_low,
            skills.lore_common_imperial_credo,
            skills.literacy,
            [skills.performer_signer, skills.trade_copyist],
            [skills.trade_cook, skills.trade_valet],
        ],
        [
            talents.weapon_cqc_prim,
            talents.weapon_hand_stub,
            [talents.weapon_main_prim, talents.weapon_throw_prim],
        ],
        [
            new Rank(
                'Неофит',
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.lore_common_imperial_credo, 1, 100),
                    new UpS(skills.literacy, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.inquiry, 1, 100),
                    new UpS(skills.pilot_civil, 1, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.trade_cook, 1, 100),
                    new UpS(skills.trade_copyist, 1, 100),
                    new UpS(skills.trade_valet, 1, 100),
                    new UpS(skills.performer_signer, 1, 200),
                ],
                [
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.resistance_cold, 100),
                    new UpT(talents.resistance_heat, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.weapon_throw_prim, 200),
                ]
            )
        ]
    ),
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
        ],
        [
            new Rank(
                "Новобранец",
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.drive_legs, 1, 200),
                ],
                [
                    new UpT(talents.weapon_main_laz, 100),
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_main_stub, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.weapon_throw_prim, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                ],
            )
        ],
    ),
    psy: new Prof(
        'Псайкер',
        new StatUpgrades(
            sud.hard,
            sud.med,
            sud.med,
            sud.med,
            sud.hard,
            sud.fast,
            sud.fast,
            sud.fast,
            sud.hard,
        ),
        [
            skills.language_gothic_low,
            skills.psyniscience,
            skills.invocation,
            [skills.trade_merchant, skills.trade_soothsayer],
            skills.literacy,
        ],
        [
            talents.weapon_cqc_prim,
            [talents.weapon_hand_stub, talents.weapon_hand_laz],
            talents.psy_rank_1,
        ],
        [
            new Rank(
                'Санкционат',
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.invocation, 1, 100),
                    new UpS(skills.literacy, 1, 100),
                    new UpS(skills.psyniscience, 1, 100),
                    new UpS(skills.lore_common_imperial_credo, 1, 100),
                    new UpS(skills.lore_common_imperium, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.lore_forbidden_warp, 1, 100),
                    new UpS(skills.lore_scholastic_occult, 1, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.trade_merchant, 1, 100), 
                    new UpS(skills.trade_soothsayer, 1, 100), 
                ],
                [
                    new UpT(talents.chem_geld, 100),
                    new UpT(talents.flagellant, 100),
                    new UpT(talents.hatred_demons, 100),
                    new UpT(talents.meditation, 100),
                    new UpT(talents.minor_psy_power, 100, true), 
                    new UpT(talents.psy_rank_1, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.quick_draw, 100), 
                    new UpT(talents.unremarcable, 100),
                    new UpT(talents.weapon_throw_prim, 100),
                    new UpT(talents.sound_constitution, 200, true),
                ],
            )
        ],
    ),
    scum: new Prof(
        'Подонок',
        new StatUpgrades(
            sud.med,
            sud.fast,
            sud.hard,
            sud.hard,
            sud.main,
            sud.med,
            sud.med,
            sud.med,
            sud.fast,
        ),
        [
            skills.language_gothic_low,
            skills.blather,
            [skills.charm, skills.dodge],
            skills.deceive,
            skills.awareness,
            skills.lore_common_imperium,
        ],
        [
            [talents.ambidexter, talents.unremarcable],
            talents.weapon_cqc_prim,
            talents.weapon_hand_stub,
            talents.weapon_main_stub,
        ],
        [
            new Rank(
                'Отребье',
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.awareness, 2, 100),
                    new UpS(skills.barter, 1, 100),
                    new UpS(skills.blather, 1, 100),
                    new UpS(skills.charm, 1, 100),
                    new UpS(skills.lore_common_imperium, 1, 100),
                    new UpS(skills.deceive, 1, 100),
                    new UpS(skills.dodge, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.navigation_land, 1, 100),
                    new UpS(skills.swim, 1, 100),
                ],
                [
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.ambidexter, 100),
                    new UpT(talents.unremarcable, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.weapon_throw_prim, 100),
                ],
            )
        ]
    ),
    tech: new Prof(
        'Техножрец',
        new StatUpgrades(
            sud.med,
            sud.med,
            sud.hard,
            sud.fast,
            sud.hard,
            sud.fast,
            sud.med,
            sud.fast,
            sud.no,
        ),
        [
            skills.language_gothic_low,
            skills.techuse,
            skills.literacy,
            skills.language_secret_techno,
            [skills.trade_scrimshawer, skills.trade_copyist],
        ],
        [
            talents.weapon_cqc_prim,
            talents.weapon_hand_laz,
            talents.weapon_main_laz,
            talents.electrowire,
        ],
        [
            new Rank(
                'Технограф',
                0,
                [
                    new UpS(skills.lore_common_mechanicus, 1, 100),
                    new UpS(skills.lore_common_technology, 1, 100),
                    new UpS(skills.lore_forbidden_omnissiah, 1, 100),
                    new UpS(skills.language_secret_techno, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.pilot_civil, 1, 100),
                    new UpS(skills.evaluate, 1, 100),
                    new UpS(skills.logic, 1, 100),
                    new UpS(skills.literacy, 1, 100),
                    new UpS(skills.literacy, 2, 100),
                    new UpS(skills.techuse, 1, 100),
                    new UpS(skills.trade_copyist, 1, 100),
                    new UpS(skills.trade_scrimshawer, 1, 100),
                ],
                [
                    new UpT(talents.weapon_main_laz, 100),
                    new UpT(talents.weapon_main_prim, 100),
                    new UpT(talents.weapon_main_stub, 100),
                    new UpT(talents.binary_chatter, 100),
                    new UpT(talents.chem_geld, 100),
                    new UpT(talents.feedback_screech, 100),
                    new UpT(talents.rapid_reload, 100),
                    new UpT(talents.electrowire, 100),
                    new UpT(talents.light_sleeper, 100),
                    new UpT(talents.weapon_hand_laz, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.weapon_cqc_prim, 100),
                    new UpT(talents.technical_knock, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.weapon_throw_prim, 300)
                ],
            ),
        ],
    ),
    sororita: new Prof(
        'Сороритас',
        new StatUpgrades(
            sud.med,
            sud.fast,
            sud.med,
            sud.med,
            sud.med,
            sud.med,
            sud.fast,
            sud.fast,
            sud.med,
        ),
        [
            skills.lore_common_imperial_credo,
            skills.literacy,
            skills.performer_signer,
            skills.language_gothic_low,
            skills.trade_copyist,
        ],
        [
            talents.weapon_main_prim,
            talents.weapon_cqc_prim,
            talents.weapon_hand_laz,
        ],
        [
            new Rank(
                'Неофтика',
                0,
                [
                    new UpS(skills.awareness, 1, 100),
                    new UpS(skills.lore_common_ecclesiarchy, 1, 100),
                    new UpS(skills.dodge, 1, 100),
                    new UpS(skills.drive_land, 1, 100),
                    new UpS(skills.lore_forbidden_warp, 1, 100),
                    new UpS(skills.performer_signer, 2, 100),
                    new UpS(skills.swim, 1, 100),
                    new UpS(skills.trade_copyist, 2, 100),
                ],
                [
                    new UpT(talents.weapon_main_laz, 100),
                    new UpT(talents.weapon_main_stub, 100),
                    new UpT(talents.weapon_hand_prim, 100),
                    new UpT(talents.weapon_hand_stub, 100),
                    new UpT(talents.sound_constitution, 100, true),
                    new UpT(talents.sound_constitution, 100, true),
                ],
            ),
        ],
    )
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
            'волосатые костяшки',
            'сросшиеся брови',
            'боевая раскраска',
            'ладони-лопаты',
            'редкие зубы',
            'кустистые брови',
            'мускусный запах',
            'волосатый',
            'рваные уши',
            'длинные ногти',
            'племенные татуировки',
            'скарификация',
            'пирсинг',
            'кошачьи глаза',
            'маленькая голова',
            'массивная челюсть',
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
    let forge = new Origin(
        "Мир-кузница",
        new Stats(15, 20, 20, 20, 20, 25, 20, 20, 20),
        [
            new RollableOption(profs.adept, 1, 25),
            new RollableOption(profs.killer, 26, 35),
            new RollableOption(profs.guard, 36, 60),
            new RollableOption(profs.scum, 61, 70),
            new RollableOption(profs.tech, 71, 100),
        ],
        [
            [skills.lore_common_mechanicus, skills.lore_common_technology],
        ],
        [
            talents.cult_outsider, 
            talents.technical_knock,
        ],
        new SecondaryMods(),
        7,
        [
            new RollableOption(1, 1, 5),
            new RollableOption(2, 6, 9),
            new RollableOption(3, 10, 10),
        ],
        [ // TODO: mix hive & space
            new RollableOption({ male: new Constitution('кулачёк', 160, 90), female: new Constitution('кулачёк', 155, 80) }, 1, 20),
            new RollableOption({ male: new Constitution('шестерня', 175, 80), female: new Constitution('шестерня', 170, 70) }, 21, 50),
            new RollableOption({ male: new Constitution('поршень', 190, 90), female: new Constitution('поршень', 185, 85) }, 51, 70),
            new RollableOption({ male: new Constitution('провод', 185, 60), female: new Constitution('провод', 180, 55) }, 71, 90),
            new RollableOption({ male: new Constitution('машина', 210, 120), female: new Constitution('машина', 200, 100) }, 91, 100),
        ],
        [
            new RollableOption(new Age('Стажёр', 15), 1, 10),
            new RollableOption(new Age('Специалист', 25), 11, 40),
            new RollableOption(new Age('Мастер', 35), 41, 70),
            new RollableOption(new Age('Мастер', 45), 71, 90),
            new RollableOption(new Age('Дед', 55), 91, 100),
        ],
        mkAppearences(
            'бледная', 'седые', 'серые',
            'красная', 'чёрные', 'карие',
            'тёмная', 'серые', 'оливковые',
            'светлая', 'рыжие', 'голубые',
            'сероватая', 'медные', 'красные',
        ),
        mkMarks(
            'бледный',
            'лысый',
            'отсутствующий палец',
            'жёлтые ногти',
            'искривлённый позвоночник',
            'сутулый',
            'гнилые зубы',
            'чумазый',
            'нервный тик',
            'электротатуировка',
            'химические ожоги',
            'хрипы',
            'безволосый',
            'пласталевый протез',
            'тяжёлая походка',
            'крупная голова',
        ),
    )
    let hive = new Origin(
        'Мир-улей',
        new Stats(20, 20, 20, 15, 20, 20, 20, 20, 25),
        [
            new RollableOption(profs.judge, 1, 17),
            new RollableOption(profs.killer, 18, 20),
            new RollableOption(profs.cleric, 21, 25),
            new RollableOption(profs.guard, 26, 35),
            new RollableOption(profs.psy, 36, 40),
            new RollableOption(profs.scum, 41, 89),
            new RollableOption(profs.tech, 90, 100),
        ],
        [
            [
                skills.techuse,
            ],
            [
                skills.language_hive,
            ]
        ],
        [
            talents.crowd_ok,
            talents.hive_addict,
            talents.caoutious,
        ],
        new SecondaryMods(),
        8,
        [
            new RollableOption(1, 1, 4),
            new RollableOption(2, 5, 8),
            new RollableOption(3, 9, 10),
        ],
        mkConstVariants(
            'коротышка', 160, 45, 'коротышка', 155, 40, 
            'сухопарый', 170, 55, 'сухопарая', 160, 50,
            'жилистый', 175, 65, 'жилистая', 165, 55,
            'длинный', 180, 65, 'длинная', 170, 60,
            'сильный', 175, 80, 'сильная', 165, 75,
        ),
        [
            new RollableOption(new Age('Пацан', 15), 1, 30),
            new RollableOption(new Age('Совершеннолетный', 25), 31, 90),
            new RollableOption(new Age('Старикан', 35), 91, 100),
        ],
        mkAppearences(
            "тёмная", "русые", "синие",
            "загорелая", "серые", "серые",
            "светлая", "крашеные", "карие",
            "красная", "седые", "зелёные",
            "крашеная", "чёрные", "линзы",
        ),
        mkMarks(
            "бледный",
            "чумазый",
            "дикая причёска",
            "гнилые зубы",
            "электротатуировка",
            "пирсинг",
            "повсеместный пирсинг",
            "сухой кашель",
            "татуировки",
            "пулевой шрам",
            "нервный тик",
            "родимое пятно",
            "химические ожоги",
            "горб",
            "маленькие руки",
            "химический запах",
        ),
        [
            new RollableOption('Помойный Пёс: Ты вырос в самых промозглых, самых тёмных глубинах улья, копаясь в отбросах в поисках еды, света и тепла. Чтобы выжить, необходимо было стать жестоким, а превыше всего ты ценишь свое личное имущество и свой же личный комфорт.', 1, 20),
            new RollableOption('Бандитская Мразь: Ты прибился к бандитской шайке, чтобы выжить в отвратительной разрухе подульев. Ты видел переделы сфер влияния, подлое предательство и самоотверженную верность – часто в одной и той же перестрелке. Превыше всего для тебя честь, дружба и неприкосновенность границ твоей территории.', 21, 40),
            new RollableOption('Заводская Муть: Твои родители вкалывали на мануфакторуме, и загнали себя в могилу, трудясь на благо улья. Ты был беден, но хотя бы честен, в отличие от тех же бандитов. Ты ценишь долг, честь и твёрдость данного слова.', 41, 60),
            new RollableOption('Средний Улей: Ты вырос в среднем улье, где все ещё тесно, но, по крайней мере, нет нужды работать на самых вредных мануфакторумах. Ты всегда был частью огромной толпы – и когда спал, и когда ел, и когда праздновал канун смены цикла. Ты, скорее всего, ценишь индивидуальность, частную собственность и свои личные права.', 61, 80),
            new RollableOption('Специалист: Твоя семья происходит из особой касты. Возможно, они посвящены в тайны работы систем кондиционирования воздуха, или занимаются чисткой обшивки улья. Ты вырос как часть толпы, но при этом отдельно от неё. Ты, скорее всего, ценишь профессионализм, наличие своей точки зрения и личных заслуг.', 81, 90),
            new RollableOption('Слуга Аристократов: Твоя семья служила непосредственно привилегированным верхам шпилей, разделяя с ними роскошь жизни, непредставимую для прочих жителей улья. У тебя было практически всё: простор, личная жизнь, солнечный свет и бремя обязанностей. Ты ценишь чувство собственного достоинства, знание своего дела, и умение быть полезным для тех, кто стоит выше тебя.', 91, 100),
        ],
    )
    let hive_gunmetal = new Origin(
        'Мир-улей (город Ганметал)',
        hive.stats.copy({ 'rc': +5 }),
        hive.profs,
        [
            hive.skills[0],
            [skills.language_local_gunmetal],
        ],
        [
            talents.caoutious,
            talents.hive_addict,
            talents.iron_loaded,
            talents.weapon_hand_stub,
            talents.path_of_weapon,
        ],
        hive.secondaryMods,
        hive.baseWounds,
        hive.fateChances,
        hive.constitutions,
        hive.ages,
        hive.appearences,
        hive.marks,
        hive.specialTrait,
    )
    let hive_volg = new Origin(
        'Мир-улей (Вольг)',
        new Stats(20, 20, 20, 25, 20, 20, 20, 20, 15),
        hive.profs,
        [
            hive.skills[0],
            [skills.language_local_volg, skills.intimidate]
        ],
        [
            talents.crowd_ok,
            talents.hive_addict,
            talents.light_sleeper,
            talents.weapon_cqc_prim,
            talents.jaded,
        ],
        new SecondaryMods(idf, idf, x => x + d10(), idf),
        hive.baseWounds,
        hive.fateChances,
        hive.constitutions,
        hive.ages,
        hive.appearences,
        hive.marks,
        hive.specialTrait,
    )
    let imperial = new Origin(
        'Имперский мир',
        new Stats(20, 20, 20, 20, 20, 20, 20, 23, 20),
        [
            new RollableOption(profs.adept, 1, 12),
            new RollableOption(profs.judge, 13, 25),
            new RollableOption(profs.killer, 26, 38),
            new RollableOption(profs.cleric, 39, 52),
            new RollableOption(profs.guard, 53, 65),
            new RollableOption(profs.psy, 66, 79),
            new RollableOption(profs.scum, 80, 90),
            new RollableOption(profs.tech, 91, 100),
        ],
        [
            [
                skills.lore_common_imperial_credo,
                skills.lore_common_imperium,
                skills.lore_common_war,
                skills.literacy,
                skills.language_gothic_high,
            ]
        ],
        [
            talents.blissful_ignorance,
        ],
        new SecondaryMods(),
        8,
        [
            new RollableOption(2, 1, 8),
            new RollableOption(3, 9, 10),
        ],
        mkConstVariants(
            "худощавый", 175, 65, "худощавая", 165, 60,
            "стройный", 185, 70, "стройная", 175, 65,
            "подтянутый", 175, 70, "подтянутая", 165, 60,
            "крепкий", 190, 90, "крепкая", 180, 80,
            "кряжистый", 180, 100, "кряжистая", 170, 90,
        ),
        [
            new RollableOption(new Age('Юноша', 20), 1, 50),
            new RollableOption(new Age('Взрослый', 25), 51, 80),
            new RollableOption(new Age('Ветеран', 40), 81, 100),
        ],
        mkAppearences(
            "тёмная", "крашеные", "голубые",
            "загорелая", "светлые", "серые",
            "светлая", "русые", "карие",
            "красная", "чёрные", "зелёные",
            "окрашенная", "седые", "линзы",
        ),
        mkMarks(
            'отсутствующий палец',
            'орлиный нос',
            'бородавки',
            'дуэльный шрам',
            'пирсинг в носу',
            'нервный тик',
            'татуировка с Аквилой',
            'тяжёлый запах',
            'оспины',
            'молитвенный шрам',
            'электротатуировка',
            'дрожь в пальцах',
            'проколотые уши',
            'жуткий чирей',
            'макияж',
            'шаркающая походка',
        ),
        [
            new RollableOption('Агромир: Ты был рождён на мире, чьим предназначением является выращивание пищи. Такие как ты всегда ищут чего-нибудь необычного или интересного, чтобы хоть как-то разбавить фермерские будни.', 1, 20),
            new RollableOption('Глухомань: Твой мир по большей части забыт Империумом. Затерявшийся в архивах Администратума и отрезанный от Империума, твой народ, как и ты сам, самодостаточен и скептичен.', 21, 40),
            new RollableOption('Феодальный Мир: Твой мир – примитивная планета, позабывшая все, кроме самых простых технологий, вроде стали, сельского хозяйства и чёрного пороха. Люди этих миров чаще всего верны, практичны и крайне суеверны.', 41, 60),
            new RollableOption('Зона Военных Действий: Каким бы твой мир ни был ранее, сейчас это кипучая масса пропитанных кровью руин, гибнущих солдат и рвущихся снарядов. Такие как ты упорны, преданны, и обладают весьма мрачной точкой зрения на всё, что происходит вокруг них.', 61, 70),
            new RollableOption('Твой мир – не более чем небольшое человеческое обиталище, выстроенное на каком-нибудь куске космического камня. Ты, скорее всего, будешь задумчивым, меланхоличным типом, оживляющимся при виде зелени и возможности жить за пределами тесных куполов.', 71, 80),
            new RollableOption('Твой родной мир управляется жрецами Императора. Местные жители чаще всего являются верными слугами Императора, набожными, надёжными и честными.', 81, 90),
            new RollableOption('Твой родной мир – одна из редких и желанных райских планет, где лето бесконечно, а жизнь беззаботна. Помимо того, что вы являетесь объектами зависти и презрения со стороны всего остального Империума, тебя и твой народ зачастую поражает жестокая природа вселенной, ведь ты встречаешь её с наивным оптимизмом, который прочие принимают за обыкновенную глупость.', 91, 100),
        ],
    )
    let imperial_maccabeus = new Origin(
        'Имперский мир (Маккабеус Квинтус)',
        new Stats(20, 20, 20, 17, 20, 20, 20, 20, 20),
        imperial.profs,
        imperial.skills,
        [
            talents.desert_world,
            talents.resistance_cold,
            ...imperial.talents,
        ],
        new SecondaryMods(idf, idf, idf, x => x + 1),
        imperial.baseWounds,
        imperial.fateChances,
        imperial.constitutions,
        imperial.ages,
        imperial.appearences,
        imperial.marks,
    )
    let imperial_sinophia = new Origin(
        'Имперский мир (Синофия)',
        new Stats(20, 20, 20, 20, 20, 20, 25, 17, 17),
        imperial.profs,
        [
            [
                skills.literacy,
                skills.language_gothic_high,
                skills.lore_common_crime,
                skills.lore_forbidden_cults,
                skills.lore_forbidden_heresy,
            ],
            [
                skills.deceive,
            ]
        ],
        [
            talents.paranoia,
        ],
        imperial.secondaryMods,
        imperial.baseWounds,
        imperial.fateChances,
        imperial.constitutions,
        imperial.ages,
        imperial.appearences,
        imperial.marks,
    )
    let space = new Origin(
        'Роджённые в Пустоте',
        new Stats(20, 20, 15, 20, 20, 20, 20, 25, 20),
        [
            new RollableOption(profs.adept, 1, 10),
            new RollableOption(profs.judge, 11, 20),
            new RollableOption(profs.killer, 21, 25),
            new RollableOption(profs.cleric, 26, 35),
            new RollableOption(profs.psy, 36, 75),
            new RollableOption(profs.scum, 76, 85),
            new RollableOption(profs.tech, 86, 100),
        ],
        [
            [
                skills.navigation_space,
                skills.pilot_space,
            ],
            [
                skills.language_ship,
            ]
        ],
        [
            talents.lucky,
            talents.evil_eye,
            talents.space_ok,
        ],
        new SecondaryMods(),
        6,
        [
            new RollableOption(2, 1, 4),
            new RollableOption(3, 5, 10),
        ],
        mkConstVariants(
            "скелет", 175, 55, "скелет", 170, 50,
            "чахлый", 165, 55, "чахлая", 155, 45,
            "костлявый", 180, 60, "костлявая", 175, 60,
            "сухопарый", 200, 80, "сухопарая", 185, 70,
            "долговязый", 210, 75, "долговязая", 195, 70,
        ),
        [
            new RollableOption(new Age('Отрок', 15), 1, 40),
            new RollableOption(new Age('Взрослый', 20), 41, 70),
            new RollableOption(new Age('Старец', 50), 71, 100),
        ],
        mkAppearences(
            'фарфоровая', 'рыжеватые', 'светло-голубые',
            'светлая', 'светлые', 'серые',
            'голубоватая', 'медные', 'чёрные',
            'сероватая', 'чёрные', 'зеленые',
            'молочная', 'золотистые', 'фиолетовые',
        ),
        mkMarks(
            'бледный',
            'лысый',
            'длинные пальцы',
            'крохотные уши',
            'худые конечности',
            'желтые ногти',
            'мелкие зубы',
            'широко расставленные глаза',
            'большая голова',
            'искривленный позвоночник',
            'безволосый',
            'элегантные руки',
            'волнистые волосы',
            'альбинос',
            'прихрамывающая походка',
            'сутулый',
        ),
        [
            new RollableOption('Космический Скиталец: Ты был рождён на скоплении обломков, лишь с натяжкой способном называться космическим кораблем. Ты вырос в мире подтекающих воздушных шлюзов, тёмных коридоров, заброшенных палуб и знания о том, что «нечто» тоже живет здесь, просто оно прячется. Ты, скорее всего, осторожен, суеверен и всегда готов спустить курок.', 1, 25),
            new RollableOption('Ты родился на огромной и древней космической станции, кружащей по орбите какой-нибудь звезды, луны или планеты. Ты рос в мире рутины и бесконечного повторения, бесконечных орбитальных циклов, уставных ритуалов и зубрежки правил эксплуатации. Ты методичен, но в душе таишь мятежный дух и стремление потворствовать своим желаниям.', 26, 50),
            new RollableOption('Чартист: Ты родился на одном из величайших кораблей древности. Ты вырос в мрачных трюмах, набитых экзотическими богатствами, которые никогда не будут твоими. Вас со страхом пускают во все порты, но ни в одном не приветствуют – ты материалист, твой глаз намётан на прибыль, а взгляд на природу людей преисполнен цинизма.', 51, 75),
            new RollableOption('Вольный Торговец: Ты родился на необычном судне, члены экипажа которого никогда не знали иной власти, кроме слова Вольного Торговца. Ты вырос в хаотичном мире разведки, битв, полётов и переговоров со всеми и всяческими силами, ксеносами и народами. По натуре ты бунтарь и не любишь дисциплину, а рутина чужда твоему характеру.', 76, 100),
        ],
    )
    let space_line_fleet = new Origin(
        'Рождённый в Пустоте (Линейный флот Каликсис)',
        space.stats.copy({ 'str': +5 }),
        space.profs,
        [
            [
                skills.techuse,
                ...space.skills[0],
            ],
            [
                skills.language_local_fleet,
            ]
        ],
        [
            talents.space_ok,
            talents.weapon_main_stub,
            talents.boarder,
            talents.officer,
        ],
        space.secondaryMods,
        space.baseWounds,
        space.fateChances,
        space.constitutions,
        space.ages,
        space.appearences,
        space.marks,
    )
    let weights = [3/13, 4/13, 4/13, 2/13]
    let patchedCV = [
        ...wild.constitutions.map(ro => new RollableOption(ro.id, ro.low * 3/13, ro.high * 3/13)),
        ...hive.constitutions.map(ro => new RollableOption(ro.id, ro.low * 4/13 + 300/13, ro.high * 4/13 + 300/13)),
        ...imperial.constitutions.map(ro => new RollableOption(ro.id, ro.low * 4/13 + 700/13, ro.high * 4/13 + 700/13)),
        ...space.constitutions.map(ro => new RollableOption(ro.id, ro.low * 2/13 + 1100/13, ro.high * 2/13 + 1100/13)),
    ]
    let patchedAppearences = [
        ...wild.appearences.map(ro => new RollableOption(ro.id, ro.low * 3/13, ro.high * 3/13)),
        ...hive.appearences.map(ro => new RollableOption(ro.id, ro.low * 4/13 + 300/13, ro.high * 4/13 + 300/13)),
        ...imperial.appearences.map(ro => new RollableOption(ro.id, ro.low * 4/13 + 700/13, ro.high * 4/13 + 700/13)),
        ...space.appearences.map(ro => new RollableOption(ro.id, ro.low * 2/13 + 1100/13, ro.high * 2/13 + 1100/13)),
    ]
    let purified = new Origin(
        'Очищеный разум',
        new Stats(20, 20, 20, 20, 20, 20, 20, 25, 15),
        [
            new RollableOption(profs.judge, 1, 15),
            new RollableOption(profs.killer, 16, 50),
            new RollableOption(profs.cleric, 51, 60),
            new RollableOption(profs.guard, 61, 80),
            new RollableOption(profs.psy, 81, 90),
            new RollableOption(profs.tech, 91, 100),
        ],
        [
            [
                skills.lore_common_technology,
                skills.survival,
            ],
            [
                skills.intimidate,
                skills.deceive,
            ],
        ],
        [
            talents.weapon_hand_laz,
            talents.weapon_hand_stub,
            talents.fuse,
            talents.imperial_training,
            talents.through_dark_mirror,
        ],
        new SecondaryMods(idf, idf, x => x + 2 + d5(), idf),
        8,
        [
            new RollableOption(2, 1, 3),
            new RollableOption(3, 4, 9),
            new RollableOption(4, 10, 10),
        ],
        patchedCV,
        [
            new RollableOption(new Age('Дитя', 15), 1, 10),
            new RollableOption(new Age('Взрослый', 25), 11, 50),
            new RollableOption(new Age('Ветеран', 35), 51, 100),
        ],
        patchedAppearences,
        mkMarks(
            'сведённая татуировка',
            "электротатуировка",
            "хлыстовые шрамы",
            "хромота",
            "восстановленная конечность",
            "оспины",
            "шрам от молнии",
            "бегающие глаза",
            "рваные уши",
            "следы кандалов",
            "выступающие вены",
            "сломанный нос",
            "гетерохромия",
            "идеальные зубы",
            "скарификация",
            "разрезанный язык",
        ),
    )
    let noble = new Origin(
        'Аристократ',
        new Stats(20, 20, 20, 20, 20, 20, 20, 15, 25),
        [
            new RollableOption(profs.adept, 1, 18),
            new RollableOption(profs.judge, 19, 30),
            new RollableOption(profs.killer, 31, 40),
            new RollableOption(profs.cleric, 41, 56),
            new RollableOption(profs.guard, 57, 75),
            new RollableOption(profs.psy, 76, 85),
            new RollableOption(profs.scum, 86, 100),
        ],
        [
            [],
            [
                skills.literacy,
                skills.language_gothic_high,
                skills.language_gothic_low,
            ],
        ],
        [
            talents.etiquette,
            talents.peer_noble,
            talents.peer_noble_special,
            talents.vendetta,
        ],
        new SecondaryMods(),
        8,
        [
            new RollableOption(1, 1, 3),
            new RollableOption(2, 4, 9),
            new RollableOption(3, 10, 10),
        ],
        patchedCV,
        [
            new RollableOption(new Age('Виконт', 15), 1, 30),
            new RollableOption(new Age('Сэр', 30), 31, 77),
            new RollableOption(new Age('Владыка', 49), 78, 100),
        ],
        patchedAppearences,
        mkMarks(
            "орлиный нос",
            "надменный взгляд",
            "маленькие стопы",
            "тонкие пальцы",
            "пухлые щёки",
            "гербовое тату",
            "длинные ногти",
            "идеальные зубы",
            "бритые руки и ноги",
            "горб",
            "нервный тик",
            "тонкий голос",
            "дуэльный шрам",
            "кровосмесительное уродство",
            "макияж",
            "стойкий перегар",
        ),
        [
            new RollableOption('Торговые Магнаты: Твоя семья контролирует обширные коммерческие операции по всему сектору и за его пределами.', 1, 15),
            new RollableOption('Военные Традиции: Твой дом выстроен на крови предков, которые были героями войн прошлого.', 16, 30),
            new RollableOption('Властители Человечества: Твоя семья происходит из наследных правителей своего родного мира и твой род – один из самых могущественных, богатейших и надёжных из всех тамошних благородных фамилий.', 31, 45),
            new RollableOption('Поставщик Империума: Твоему дому принадлежат обширнейшие владения, основным продуктом которых является жизненно важное для Империума сырьё.', 46, 60),
            new RollableOption('Дом Железных Шпилей: Ты происходишь из благородных семей мира-улья.', 61, 75),
            new RollableOption('Кровь Величия: Один из твоих предков был легендарным героем Империума.', 76, 85),
            new RollableOption('Удача Бродяги: Твоя семья владеет древней хартией Вольного Торговца, и её состояние было выковано в холодной тьме меж далеких звёзд.', 86, 95),
            new RollableOption('Оскверненная Кровь: Твоя семья – не то, чем кажется. Некогда твои предки были опозорены, обесчещены или претерпели бедствие, призрак которого до сих пор довлеет над твоей благородной фамилией, из-за чего она обладает лишь тенью своей былой славы.', 96, 100),
        ],
    )
    let progena = new Origin(
        'Схола Прогениум',
        new Stats(20, 20, 20, 20, 20, 20, 20, 20, 20),
        [
            new RollableOption(profs.adept, 1, 20),
            new RollableOption(profs.judge, 21, 40),
            new RollableOption(profs.cleric, 41, 60),
            new RollableOption(profs.guard, 61, 80),
            new RollableOption(profs.sororita, 81, 100),
        ],
        [
            [
                skills.lore_common_administratum,
                skills.lore_common_ecclesiarchy,
                skills.lore_common_imperial_credo,
                skills.lore_common_imperium,
                skills.lore_common_war,
            ],
            [
                skills.language_gothic_high,
                skills.language_gothic_low,
                skills.literacy,
            ],
        ],
        [
            talents.weapon_cqc_prim,
            [talents.weapon_hand_stub, talents.weapon_hand_laz],
            [talents.weapon_main_stub, talents.weapon_main_laz],
            talents.hardened_will,
            talents.scholast,
        ],
        new SecondaryMods(),
        8,
        [
            new RollableOption(1, 1, 2),
            new RollableOption(2, 3, 7),
            new RollableOption(3, 8, 10),
        ],
        patchedCV,
        [
            new RollableOption(new Age('Выпускник', 20), 1, 70),
            new RollableOption(new Age('Ветеран', 30), 71, 100),
        ],
        patchedAppearences,
        mkMarks(
            "большой лоб",
            "сутулый",
            "горб",
            "нервный тик",
            "широко расставленные глаза",
            "лысый",
            "бледный",
            "элегантные руки",
            "молитвенный шрам",
            "орлиный нос",
            "жуткий чирей",
            "бородавки",
            "ладони-лопаты",
            "татуировка с Аквилой",
            "маленькие зубы",
            "массивная челюсть",
        ),
        [
            new RollableOption('Мученики Войны: Твои родители состояли в Имперской Гвардии и пали от руки врагов человечества.', 1, 25),
            new RollableOption('Жертвы Мятежа: Твои родители были лоялистами Империума, попавшими в руки бунтовщиков.', 26, 45),
            new RollableOption('Отдаленный Форпост: Твои родители были отправлены на удаленный и уединенный форпост, столь далекий, что ты успеешь умереть до того, как с ним наладится хоть какое-то сообщение.', 46, 65),
            new RollableOption('Затерянные в Пустоте: Твои родители были верными слугами Адептус Терра, и пропали без вести вместе с кораблем, на котором они путешествовали.', 66, 75),
            new RollableOption('Без Следа: Нет никаких записей о том, что случилось с твоими родителями, хотя ты прекрасно знаешь, кем они были, все записи о них с какого-то определённого момента просто исчезли из всех архивов.', 76, 85),
            new RollableOption('Без Возврата: Твои родители были приписаны к Имперскому крестовому походу или экспедиции Вольного Торговца, которые отправлялись далеко за пределы Имперского космоса и так и не вернулись.', 86, 95),
            new RollableOption('Ореол Молчания: Никто не говорит с тобой о твоих родителях или твоей семье. Ты понятия не имеешь, кем они были и как погибли; все запросы о них разбиваются о каменную стену молчания.', 96, 100),
        ],
    )
    return { // ОБЯЗАТЕЛЬНО ВНЕСТИ СЮДА
        'wild': wild,
        'wild_dusk': wild_dusk,
        'forge': forge,
        'hive': hive,
        'hive_gunmetal': hive_gunmetal,
        'hive_volg': hive_volg,
        'imperial': imperial,
        'imperial_maccabeus': imperial_maccabeus,
        'imperial_sinophia': imperial_sinophia,
        'space': space,
        'space_line_fleet': space_line_fleet,
        'purified': purified,
        'noble': noble,
        'progena': progena,
    }
}()

// Если мир не является вариантом другого, то его можно вписать сюда с соответствующим диапазоном
let rollableOrigins = [
    new RollableOption(origins.wild, 1, 15), // 00-15: Дикий мир
    new RollableOption(origins.hive, 16, 35),
    new RollableOption(origins.imperial, 36, 55),
    new RollableOption(origins.space, 56, 65),
    new RollableOption(origins.forge, 66, 75), // 66-75: Мир-кузница
    new RollableOption(origins.progena, 76, 85),
    new RollableOption(origins.noble, 86, 95),
    new RollableOption(origins.purified, 96, 100),
]

/**
 * Добавление предысторий к профессиям
 */
;(function () {
    let anyOrigin = new Set(Object.keys(origins).map(o => origins[o].name))
    console.log('anyOrigin in backgrounds: ' + [...anyOrigin].map(o => o.name))
    profs.adept.backgrounds = [
        new Background(
            'Квестор Муниторума',
            100,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.command,
                    skills.lore_common_imperial_guard,
                    skills.inquiry,
                    skills.search,
                    skills.security,
                ],
            ],
            [
                talents.paranoia,
            ],
            new Stats().copy({ wil: -5, cha: -5 }),
        ),
        new Background(
            'Учёный Коллегии Хетаирея Лексис',
            100,
            '',
            new Set([
                origins.imperial.name,
                origins.noble.name,
            ]),
            [
                [],
                [
                    skills.ciphers_secret_society_hetairea,
                    skills.lore_scholastic_any,
                    skills.lore_forbidden_any,
                ],
            ],
            [
                talents.peer_academia,
            ],
            new Stats().copy({ cqc: -5, str: -5, int: +3 }),
        ),
        new Background(
            'Спатиум Коммерциа',
            200,
            '',
            new Set([
                origins.space.name,
            ]),
            [
                [],
                [
                    skills.barter,
                    skills.charm,
                    skills.lore_common_imperium,
                    skills.lore_common_commerce,
                    skills.evaluate,
                    skills.scrutiny,
                    skills.language_secret_any,
                ]
            ],
            [],
            new Stats().copy({ cqc: -5, con: -5 }),
        )
    ]
    profs.judge.backgrounds = [
        new Background(
            "Каликсианский серийный убийца",
            200,
            '',
            anyOrigin,
            [],
            [
                talents.talented_inquiry,
            ],
            new Stats().copy({ int: +5, per: +5 }),
        ),
        new Background(
            'Пустые люди с Синофии Магна',
            100,
            '',
            anyOrigin,
            [],
            [
                talents.hatred_tech_heresy,
                talents.paranoia,
            ],
            new Stats(),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
        new Background(
            'Красные склепы Луггнума',
            100,
            '',
            anyOrigin,
            [],
            [
                talents.jaded,
            ],
            new Stats().copy({ wil: +3 }),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
    ]
    profs.killer.backgrounds = [
        new Background(
            'Клинки Звёзд',
            200,
            'Клинки Звёзд – члены запретного тайного общества. Если членство Аколита в нем всплывет на поверхность, он рискует испытать на себе гнев Арбитров, охотников на ведьм, а также Инквизиторов, значительно менее «понимающих», нежели их господин.',
            new Set([
                origins.space.name,
            ]),
            [
                [
                    skills.lore_forbidden_warp,
                    skills.tech,
                ],
                [
                    skills.ciphers_blades,
                    skills.deceive,
                ],
            ],
            [],
            new Stats(),
            new SecondaryMods(idf, x => x + d5(), idf, idf),
        ),
        new Background(
            "Сыны Диспатера",
            100,
            'Любой из Сынов Диспатера, нарушивший контракт – даже во благо Инквизиции – и давший информации об этом утечь, получает чёрную метку, обладатель которой становится желанной добычей для каждого из его бывших коллег.',
            anyOrigin,
            [
                [], // Нет базовых умений
                [   // +0
                    skills.lore_common_crime,
                    skills.intimidate,
                    skills.security,
                ],
            ],
        ),
        new Background(
            'Моритат',
            300,
            'Кровавое Лезвие: Моритат презирают современное оружие, считая его грубым и бездушным, предпочитая священную сталь клинка. Они должны пройти Тяжёлый (-20) Тест Силы Воли, чтобы использовать в бою любое оружие, не имеющее «лезвия», кроме случаев, когда «правильное» оружие явно не сможет нанести врагу никакого вреда. Однако в обращении с клинками Моритат настолько искусны, что в их руках они считаются Разрывными.',
            new Set([
                origins.wild.name, 
                origins.imperial.name,
                origins.hive.name,
            ]),
            [
                [],
                [
                    skills.climb,
                    skills.shadowing,
                    skills.silent_move,
                    skills.language_secret_moritat,
                ],
            ],
            [
                talents.jaded,
            ],
            new Stats(),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
    ]
    profs.cleric.backgrounds = [
        new Background(
            'Великие Приделы Тарсуса',
            200,
            '',
            new Set([
                origins.noble.name,
                origins.imperial.name,
                origins.hive.name,
            ]),
            [
                [],
                [
                    skills.charm,
                    skills.lore_common_ecclesiarchy,
                    skills.scrutiny,
                    skills.language_gothic_high,
                ],
            ],
            [
                talents.peer_ecclisearchy,
            ],
            new Stats(-5, -5, -5, 0, 0, +5, 0, 0, +5),
        ),
        new Background(
            'Нищенствующий проповедник',
            100,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.lore_common_imperium,
                    skills.lore_scholastic_legends,
                    skills.navigation_land,
                    skills.survival,
                ],
            ],
        ),
        new Background(
            'Разжигатель Искупления',
            200,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.interrogation,
                    skills.intimidate,
                ],
            ],
            [
                talents.weapon_cqc_chain,
                talents.weapon_main_fire,
                talents.unshakeable_faith,
            ],
            new Stats(),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
    ]
    profs.guard.backgrounds = [
        new Background(
            'Резня при Высадке на Маре',
            200,
            '',
            anyOrigin,
            [],
            [
                talents.resistance_psy,
            ],
            new Stats().copy({ 'wil': +5 }),
            new SecondaryMods(idf, x => x + d5(), x => x + d10(), x => x + 1),
        ),
        new Background(
            'Солдат Пограничного Крестового Похода',
            200,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.awareness,
                    skills.survival,
                ],
            ],
            [
                talents.unshakeable_faith,
            ],
            new Stats().copy({ 'con': -3 }),
        ),
        new Background(
            'Ветеран Войны на Тренче',
            100,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.search,
                ],
            ],
            [
                talents.hatred_mutants,
                talents.light_sleeper,
            ],
            new Stats(),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
    ]
    profs.psy.backgrounds = [
        new Background(
            'Тень на твоей душе',
            200,
            '',
            anyOrigin,
            [
                [],
                [
                    skills.lore_forbidden_demonology,
                ],
            ],
            [
                talents.dark_soul,
            ],
            new Stats(),
            new SecondaryMods(
                idf,
                x => x + d5(),
                x => x + d5(),
                idf,
            ),
        ),
        new Background(
            'Путеводный свет Бога-Императора',
            100,
            '',
            anyOrigin,
            [],
            [
                talents.hatred_witches,
                talents.insanely_faithful,
            ],
            new Stats().copy({ str: -5 }),
        ),
        new Background(
            'Кошмар наяву',
            300,
            'Непроницаемый Разум: Содержимое твоего разума нельзя прочитать психическими и любыми иными способами, а любая попытка проделать подобное обнаружит лишь непроницаемую и тёмную пустоту.',
            anyOrigin,
            [],
            [
                talents.resistance_psy,
            ],
            new Stats().copy({ wil: +5 }),
            new SecondaryMods(
                idf,
                idf,
                x => x + d10(),
                idf,
            ),
        )
    ]
    let hunterOrigins = new Set([
        origins.wild.name,
        origins.imperial.name,
        origins.hive.name,
    ])
    let hunterTalents = [
        talents.peer_criminal,
        talents.weapon_cqc_shock,
    ]
    let hunterSM = new SecondaryMods(idf, x => x + d5(), idf, idf)
    let mkHunter = (s, ss) => new Background(
        'Зверолов ' + ss,
        100,
        '',
        hunterOrigins,
        [
            [],
            [
                s,
            ]
        ],
        hunterTalents,
        new Stats(),
        hunterSM,
    )
    profs.scum.backgrounds = [
        mkHunter(skills.lore_forbidden_mutants, '(мутанты)'),
        mkHunter(skills.lore_scholastic_beasts, '(звери)'),
        new Background(
            'Курьер Холодной Гильдии',
            100,
            '',
            new Set([
                origins.space.name,
            ]),
            [],
            [
                talents.peer_voidborn,
                talents.concealed_cavity,
                talents.talented_concealment,
            ],
            new Stats().copy({ per: +5, con: -5 }),
        ),
        new Background(
            'Братство Толлоса',
            200,
            '',
            new Set([
                origins.hive.name, 
                origins.imperial.name,
            ]),
            [],
            [
                talents.peer_criminal,
                talents.street_fighter,
            ],
            new Stats().copy({ cqc: +3, con: +3, cha: -5 }),
        ),
    ]
    profs.tech.backgrounds = [
        new Background(
            'Апостолы Туле',
            100,
            '',
            new Set([
                origins.forge.name, 
                origins.space.name,
            ]),
            [
                skills.lore_common_mechanicus,
                skills.evaluate,
                skills.lore_forbidden_archeotech,
                skills.logic,
                skills.lore_scholastic_crypto,
            ],
            [],
            new Stats().copy({ cqc: -5, per: -5 }),
        ),
        new Background(
            'Божественный Свет Соллекса',
            300,
            '',
            new Set([
                origins.forge.name,
            ]),
            [
                [],
                [
                    skills.ciphers_secret_society_sollex,
                    skills.lore_common_mechanicus,
                    skills.demolition,
                    skills.lore_scholastic_tactics,
                ],
            ],
            [
                talents.divine_light,
                talents.hatred_tech_heresy,
                talents.unshakeable_faith,
            ],
            new Stats().copy({ cha: -5 }),
            new SecondaryMods(idf, idf, x => x + d5(), idf),
        ),
        new Background(
            'Малигрисианская техноересь',
            200,
            'Учения Малигриса: Впитав это знание, ты рискнул больше чем своей жизнью. Если источник твоей осведомленности каким-либо образом будет доказан, ты немедленно попадешь в чёрный список Культа Механикус.',
            new Set([
                origins.space.name,
                origins.forge.name,
            ]),
            [
                [],
                [
                    skills.ciphers_maligris,
                    skills.lore_forbidden_warp,
                    skills.lore_forbidden_xenos,
                    skills.lore_scholastic_legends,
                    skills.lore_scholastic_numerology,
                ],
            ],
            [],
            new Stats(),
            new SecondaryMods(idf, x => x + d5(), x => x + d5(), idf),
        ),
    ]
})()

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

let getSpecialStatUp = (stat) => {
    var mod = 0
    if (character.origin !== undefined) {
        let forge = origins.forge
        if (character.origin.name.substring(0, forge.name.length) == forge.name) {
            if (character.prof !== undefined) {
                switch (character.prof.name) {
                    case profs.adept.name: if (stat == 'int') mod += 3; break
                    case profs.killer.name: if (stat == 'dex') mod += 3; break
                    case profs.guard.name: if (stat == 'rc') mod += 3; break
                    case profs.scum.name: if (stat == 'per') mod += 3; break
                    case profs.tech.name: if (stat == 'wil') mod += 3; break
                }
            }
        }
    }
    return mod
}

let vm = {}

function render() {
    let psyMod = character?.sanctionating?.mod ?? new PsyMod()
    let finalStats = new Stats()
    if (character.rolledStats !== undefined && character.origin != undefined) {
        let bioSM = character.bio === undefined ? new Stats() : character.bio.statMod
        Object.keys(vm.stats).forEach(s => {
            let statValue = character.rolledStats[s] + character.origin.stats[s] + character.statUpgrades[s] + bioSM[s] + getSpecialStatUp(s) + psyMod.stats[s]
            finalStats[s] = statValue
            vm.stats[s].innerText = String(statValue)
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
                if (Number.isFinite(cost)) {
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
                    } else if (curTSU === curCSU - 5) {
                        cell.onclick = function () {
                            character.statUpgrades[s] -= 10
                            render()
                        }
                    } else if (curTSU === curCSU - 10) {
                        cell.onclick = function () {
                            character.statUpgrades[s] -= 15
                            render()
                        }
                    } else if (curTSU === curCSU -15) {
                        cell.onclick = function () {
                            character.statUpgrades[s] -= 20
                            render()
                        }
                    } else if (curCSU + 5 === curTSU) {
                        cell.onclick = function () {
                            character.statUpgrades[s] += 5
                            render()
                        }
                    } else if (curCSU + 10 === curTSU) {
                        cell.onclick = function () {
                            character.statUpgrades[s] += 10
                            render()
                        }
                    } else if (curCSU + 15 === curTSU) {
                        cell.onclick = function () {
                            character.statUpgrades[s] += 15
                            render()
                        }
                    } else if (curCSU + 20 === curTSU) {
                        cell.onclick = function () {
                            character.statUpgrades[s] += 20
                            render()
                        }
                    }
                } else {
                    cell.innerText = '–'
                    cell.className = ''
                    cell.onclick = undefined
                }
                r.append(cell)
            }
            vm.statUpTable.append(r)
        }
        // ranks
        vm.upgrades.innerHTML = ''
        let repCount = {}
        for (let rank of character.prof.ranks) {
            let rankName = document.createElement('p')
            rankName.innerText = rank.name + ' (' + (rank.level * 500) + ' ОО)'
            vm.upgrades.append(rankName)

            let rankSTable = document.createElement('table')
            let rankSkills = document.createElement('tbody')
            rankSTable.append(rankSkills)
            rankSTable.setAttribute('width', '100%')
            for (let su of rank.skills) {
                let row = document.createElement('tr')
                let sn = document.createElement('td')
                sn.innerText = su.option.name
                let sl = document.createElement('td')
                sl.innerText = su.level
                let sc = document.createElement('td')
                sc.innerText = su.cost
                row.append(sn, sl, sc)
                if (character.skills !== undefined) {
                    let cslMaybe = character.skills.get(su.option.name)
                    let csl = cslMaybe === undefined ? [] : cslMaybe
                    var isPicked = false
                    var isUseless = false
                    var isPickedPrevious = false
                    var isPickedNext = false
                    for (let cse of csl) {
                        if (cse.level == su.level) {
                            if (cse.skillOrigin.from == 'buy') {
                                isPicked = true
                            } else {
                                isUseless = true
                            }
                        }
                        if (cse.level + 1 == su.level) isPickedPrevious = true
                        if (cse.level - 1 == su.level) isPickedNext = true
                    }
                    if (isPicked) {
                        row.className = 'picked'
                        if (!isPickedNext) {
                            row.onclick = function () {
                                csl.pop()
                                render()
                            }
                        }
                    } else if (isUseless) {
                        row.className = 'useless'
                    } else if (isPickedPrevious || su.level == 1) {
                        row.className = ''
                        row.onclick = function () {
                            let item = new RenderedSkill(
                                su.option,
                                su.level,
                                {
                                    from: 'buy',
                                    cost: su.cost,
                                },
                            )
                            csl.push(item)
                            if (cslMaybe === undefined) {
                                character.skills.set(su.option.name, csl)
                            }
                            render()
                        }
                    } else {
                        row.className = 'bad'
                    }
                }
                rankSkills.append(row)
            }
            vm.upgrades.append(rankSTable)

            let rankTTable = document.createElement('table')
            let rankTalents = document.createElement('tbody')
            rankTTable.append(rankTalents)
            rankTTable.setAttribute('width', '100%')
            for (let tu of rank.talents) {
                let t = tu.option
                if (tu.repeatable) {
                    if (repCount[t.name] === undefined) {
                        repCount[t.name] = 1
                    } else {
                        ++repCount[t.name]
                    }
                }
                let row = document.createElement('tr')
                let tn = document.createElement('td')
                if (tu.repeatable) {
                    tn.innerText = t.name + ' (' + repCount[t.name] + ')'
                } else {
                    tn.innerText = t.name
                }
                let treq = document.createElement('td')
                var treqStr = ''
                for (let s of Object.keys(t.requirements.stats)) {
                    let sVal = t.requirements.stats[s]
                    if (sVal > 0) {
                        treqStr += statNames[s] + ': ' + sVal + '; '
                    }
                }
                for (let rqt of t.requirements.talents) {
                    treqStr += rqt.name + '; '
                }
                treq.innerText = treqStr
                let tc = document.createElement('td')
                tc.innerText = tu.cost
                row.append(tn, treq, tc)
                var isUseless = false
                var isPicked = false
                let pickedReps = {}
                let reqTalents = [ ...t.requirements.talents ]
                if (character.talents !== undefined) {
                    for (let ct of character.talents) {
                        let rqt = reqTalents.findIndex(q => q.name === ct.name)
                        if (rqt !== -1) {
                            reqTalents.splice(rqt, 1)
                        }
                        if (ct.talent.name === t.name) {
                            if (ct.talentOrigin.from === 'buy') {
                                if (tu.repeatable) {
                                    if (pickedReps[t.name] === undefined) {
                                        pickedReps[t.name] = 0
                                    }
                                    ++pickedReps[t.name]
                                    if (pickedReps[t.name] >= repCount[t.name]) {
                                        isPicked = true
                                    }
                                } else {
                                    isPicked = true
                                    break
                                }
                            } else {
                                isUseless = true
                            }
                        }
                    }
                }
                var enoughStats = true
                for (let s of Object.keys(finalStats)) {
                    if (t.requirements.stats[s] > finalStats[s]) {
                        enoughStats = false
                        break
                    }
                }
                if (isPicked) {
                    row.className = 'picked'
                    row.onclick = function () {
                        character.talents.splice(character.talents.findIndex(rt => rt.talent.name === t.name), 1)
                        render()
                    }
                } else if (isUseless) {
                    row.className = 'useless'
                } else if (reqTalents.length == 0 && enoughStats) {
                    row.className = ''
                    row.onclick = function () {
                        character.talents.push(new RenderedTalent(t, { from: 'buy', cost: tu.cost }))
                        render()
                    }
                } else {
                    row.className = 'bad'
                }
                rankTalents.append(row)
            }
            vm.upgrades.append(rankTTable)
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
    var soundConstBonus = 0
    let renderTalents = vm.renderTalents
    if (renderTalents !== undefined && character.talents !== undefined) {
        let toRender = character.talents.concat(psyMod.talents.map(t => new RenderedTalent(t, { from: 'psy' })))
        renderTalents(toRender)
        for (let t of character.talents) {
            let o = t.talentOrigin
            if (o.from == 'buy') {
                usedExp += o.cost
            }
            if (t.talent.name == sound_constitution.name) {
                ++soundConstBonus
            }
        }
    }
    if (character.bio !== undefined) {
        vm.bioNote.innerText = character.bio.specialNote
        usedExp += character.bio.cost
    } else {
        vm.bioNote.innerText = ''
    }
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
        let frsi = rsl.findIndex(frs => frs.level === newRS.level && frs.skillOrigin.from === 'buy')
        if (frsi !== -1) {
            rsl.splice(frsi, 1)
        }
        rsl.sort(rsCompare)
    })
    renderDelayed(character.delayedTalents, character.talents, (taken, s, from, ix) => taken.push(new RenderedTalent(s, { from: from, ix: ix })))
    vm.woundSpan.innerText = String(character.wounds + soundConstBonus)
    vm.fateSpan.innerText = String(character.fate)
    vm.corruptSpan.innerText = String(character.corrupt)
    vm.madnessSpan.innerText = String(character.madness)
    vm.sexBox.value = character.sex
    vm.handBox.value = character.hand
    vm.specialSpan.innerText = character.specialTrait == undefined ? '—/—' : String(character.specialTrait)
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
    if (character.sanctionating !== undefined) {
        let ss = character.sanctionating
        vm.sanctionatingField.className = 'base'
        vm.sanctionatingSpan.innerText = ss.name + ': ' + ss.description
    } else {
        vm.sanctionatingField.className = 'off'
        vm.sanctionatingSpan.innerText = ''
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
    if (p !== undefined && o !== undefined) {
        let specialOriginIx = character.origin.name.search(' \\(')
        let shortOriginName = specialOriginIx == -1 ? character.origin.name : character.origin.name.substring(0, specialOriginIx)
        console.log('bio for: ' + shortOriginName)
        let test = specialOriginIx == -1 ? (ao) => ao.has(character.origin.name) : (ao) => ao.has(shortOriginName) || ao.has(character.origin.name)
        for (let b of character.prof.backgrounds) {
            console.log('bio: ' + b.name)
            console.log('allowed origins: ' + [ ...b.allowedOrigin ])
            if (test(b.allowedOrigin)) {
                console.log('allowed')
                let bo = document.createElement('option')
                bo.value = b.name
                bo.text = b.name
                vm.bioSelect.append(bo)
            }
        }
        vm.bioSelect.onchange()
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

function combine() {
    return (x) => Array.from(arguments).filter(f => typeof f === 'function').reduce((acc, f) => f(acc), x)
}

let rolls = {
    wound: function () {
        if (character.origin !== undefined) {
            let w = character.origin.baseWounds
            character.wounds = combine(
                character.origin?.secondaryMods?.wounds, 
                character.bio?.secondaryMods?.wounds,
                character.sanctionating?.mod?.secondaryMods?.wounds,
            )(w + d5())
        } else {
            character.wounds = 0
        }
    },
    fate: function () {
        if (character.origin !== undefined) {
            let f = rollOption(character.origin.fateChances, d10)
            character.fate = combine(
                character.origin?.secondaryMods?.fate, 
                character.bio?.secondaryMods?.fate,
                character.sanctionating?.mod?.secondaryMods?.fate,
            )(f)
        } else {
            character.fate = 0
        }
    },
    corrupt: function () { // todo character.bio.secondaryMods
        character.corrupt = combine(
            character.origin?.secondaryMods?.corrupt, 
            character.bio?.secondaryMods?.corrupt,
            character.sanctionating?.mod?.secondaryMods?.corrupt,
        )(0)
    },
    madness: function () {
        var baseMadness = 0
        if (character.talents !== undefined) {
            if (character.talents.find(t => t.talent.name === chem_geld.name) !== undefined 
             || character.sanctionating?.mod?.talents.find(t => t.name === chem_geld.name) !== undefined) 
               baseMadness += 1
        }
        character.madness = combine(
            character.origin?.secondaryMods?.madness, 
            character.bio?.secondaryMods?.madness,
            character.sanctionating?.mod?.secondaryMods?.madness,
        )(baseMadness)
    },
    sex: function () {
        if (character.prof.name === profs.sororita.name) {
            character.sex = 'female'
        } else {
            let r = d10()
            character.sex = r % 2 == 0 ? 'male' : 'female'
        }
    },
    hand: function () {
        let r = d10()
        character.hand = r == 9 ? 'left' : 'right'
    },
    constitution: function () {
        character.constitution = rollOption(character.origin.constitutions)
    },
    age: function () {
        let ageType = rollOption(character.origin.ages)
        character.age = {
            n: character.prof == profs.psy
                ? ageType.roll() + d10() + d10() + d10()
                : ageType.roll(),
            d: ageType.description,
        }
    },
    appearence: function () {
        character.appearence = rollOption(character.origin.appearences)
    },
    special: function () {
        character.specialTrait = rollOption(character.origin.specialTrait)
    },
    newMark: function () {
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
    },
    newName: function () {
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
    },
    statsFull: function () {
        let rs = new Stats()
        for (let k of Object.keys(rs)) {
            rs[k] = d10() + d10()
        }
        character.rolledStats = rs
    },
    sanctionating: function () {
        if (character.prof == profs.psy) {
            character.sanctionating = rollOption(sanctionationSideEffects)
        } else {
            character.sanctionating = undefined
        }
    }
}

function selectOrigin(origin) {
    let oldOrigin = character.origin
    character.origin = origin
    if (oldOrigin === undefined || (character.origin !== undefined && oldOrigin.name !== character.origin.name)) {
        vm.professions.innerHTML = ''
        for (let p of character.origin.profs) {
            let option = document.createElement('option')
            option.value = p.id.name
            option.text = p.id.name + ' [' + p.low + '..' + p.high + ']'
            if (character.prof !== undefined && character.prof.name == p.id.name) option.selected = true
            vm.professions.append(option)
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
    }
}

function randomCharacter(origin, prof) {
    if (origin === undefined) {
        selectOrigin(rollOption(rollableOrigins))
    } else {
        selectOrigin(origin)
    }
    document.getElementById('world').value = Object.keys(origins).find(k => origins[k].name == character.origin.name)
    let newProf = (prof === undefined) ? rollOption(character.origin.profs) : prof
    vm.professions.value = newProf.name
    vm.professions.onchange()
    rolls.sex()
    rolls.hand()
    rolls.appearence()
    rolls.constitution()
    rolls.age()
    rolls.special()
    character.marks = []
    let markCnt = Math.max(d5(), d5())
    for (let i = 0; i < markCnt; ++i) {
        rolls.newMark()
    }
    character.names = []
    let nameCount = d5()
    for (let i = 0; i < nameCount; ++i) {
        rolls.newName()
    }
    rolls.statsFull()
    rolls.wound()
    rolls.corrupt()
    rolls.madness()
    rolls.fate()
}

function bind() {
    vm.rollLog = document.getElementById('rollLog')
    // stats
    vm.stats = {}
    vm.woundSpan = document.getElementById('wounds')
    let woundRoll = document.getElementById('woundRoll')
    woundRoll.onclick = function () {
        rolls.wound()
        render()
    }
    vm.fateSpan = document.getElementById('fate')
    let fateRoll = document.getElementById('fateRoll')
    fateRoll.onclick = function () {
        rolls.fate()
        render()
    }
    vm.corruptSpan = document.getElementById('corrupt')
    let corruptRoll = document.getElementById('corruptRoll')
    corruptRoll.onclick = function () {
        rolls.corrupt()
        render()
    }
    vm.madnessSpan = document.getElementById('madness')
    let madnessRoll = document.getElementById('madnessRoll')
    madnessRoll.onclick = function () {
        rolls.madness()
        render()
    }

    vm.sexBox = document.getElementById('sex')
    vm.sexBox.onchange = function () {
        character.sex = vm.sexBox.value
        render()
    }
    document.getElementById('sexRoll').onclick = function () {
        rolls.sex()
        render()
    }

    vm.handBox = document.getElementById('hand')
    vm.handBox.onchange = function () {
        character.hand = vm.handBox.value
        render()
    }
    document.getElementById('handRoll').onclick = function () {
        rolls.hand()
        render()
    }

    vm.constDescriptionSpan = document.getElementById('constitution')
    vm.heightSpan = document.getElementById('height')
    vm.weightSpan = document.getElementById('weight')
    document.getElementById('constitutionRoll').onclick = function () {
        if (character.sex !== undefined && character.origin !== undefined) {
            rolls.constitution()
            render()
        }
    }

    vm.ageSpan = document.getElementById('age')
    vm.ageDescriptionSpan = document.getElementById('ageDescription')
    document.getElementById('ageRoll').onclick = function () {
        if (character.origin !== undefined) {
            rolls.age()
            render()
        }
    }

    vm.skin = document.getElementById('skin')
    vm.hair = document.getElementById('hair')
    vm.eyes = document.getElementById('eyes')
    document.getElementById('appearanceRoll').onclick = function () {
        if (character.origin !== undefined) {
            rolls.appearence()
            render()
        }
    }

    vm.specialSpan = document.getElementById('specialOO')
    document.getElementById('specialOORoll').onclick = function () {
        if (character.origin !== undefined) {
            rolls.special()
            render()
        }
    }

    vm.sanctionatingField = document.getElementById('sanctionatingField')
    vm.sanctionatingSpan = document.getElementById('sanctionating')
    document.getElementById('sanctionatingRoll').onclick = function () {
        if (character.prof == profs.psy) {
            rolls.sanctionating()
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
            rolls.newMark()
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
            rolls.newName()
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
        rolls.statsFull()
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
        selectOrigin(origins[world.value])
        render()
    }
    vm.professions = document.getElementById('prof')
    vm.professions.onchange = function () {
        if (character.origin !== undefined) {
            console.log('new prof: ' + vm.professions.value)
            let oldProf = character.prof
            character.prof = character.origin.profs.find(x => x.id.name == vm.professions.value).id
            console.log('found prof: ' + character.prof.name)
            if (oldProf === undefined || (character.prof !== undefined && oldProf.name != character.prof.name)) {
                vm.bioSelect.innerHTML = ''
                let noBio = document.createElement('option')
                noBio.value = 'none'
                noBio.text = '-= НЕТ =-'
                vm.bioSelect.append(noBio)
                vm.bioSelect.value = 'none'
                character.skills = new Map()
                character.talents = []
                buildCharacter()
                rolls.sanctionating()
                render()
            }
        }
    }
    vm.professions.onchange()
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
                sOrigin.onclick = function () {
                    let rsl = character.skills.get(r.skill.name)
                    rsl.pop()
                    if (rsl.length == 0) {
                        character.skills.delete(r.skill.name)
                    }
                    render()
                }
            } else if (o.from == 'base') {
                sOrigin.innerText = 'Базовый'
            } else if (o.from == 'bio') {
                sOrigin.innerText = 'Прошлое'
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
                sOrigin.onclick = function () {
                    character.talents.splice(character.talents.findIndex(x => x.talent.name == r.talent.name), 1)
                    render()
                }
            } else if (o.from == 'bio') {
                sOrigin.innerText = 'Прошлое'
            } else if (o.from == 'psy') {
                sOrigin.innerText = 'Терра'
            }
            row.append(sName, sOrigin)
            vm.talents.append(row)
        }
    }
    vm.delayed = document.getElementById('delayed')
    vm.upgrades = document.getElementById('upgrades')
    document.getElementById('fullRoll').onclick = function () {
        randomCharacter(character.origin, character.prof)
        render()
    }
    document.getElementById('profRoll').onclick = function () {
        if (character.origin !== undefined) {
            let newProf = rollOption(character.origin.profs)
            vm.professions.value = newProf.name
            vm.professions.onchange()
        }
    }
    document.getElementById('worldRoll').onclick = function () {
        let newOrigin = rollOption(rollableOrigins)
        world.value = Object.keys(origins).find(k => origins[k].name == newOrigin.name)
        selectOrigin(newOrigin)
        render()
    }
    vm.bioSelect = document.getElementById('bio')
    vm.bioSelect.onchange = function () {
        if (character.prof !== undefined) {
            let b = character.prof.backgrounds.find(b => b.name == vm.bioSelect.value)
            for (let sl of character.skills.values()) {
                for (let i = 0; i < sl.length; ++i) {
                    while (sl[i].skillOrigin.from == 'bio') {
                        sl.splice(i, 1)
                        if (i >= sl.length) break
                    }
                }
            }
            for (let i = 0; i < character.talents.length; ++i) {
                while (character.talents[i].talentOrigin.from == 'bio') {
                    character.talents.splice(i, 1)
                    if (i >= character.talents.length) break
                }
            }
            if (b !== undefined) {
                for (let lvl = 0; lvl < b.skills.length; ++lvl) {
                    for (let s of b.skills[lvl]) {
                        var sl = character.skills.get(s.name)
                        if (sl === undefined) {
                            sl = []
                            character.skills.set(s.name, sl)
                        }
                        sl.push(new RenderedSkill(s, lvl, { from: 'bio' }))
                        sl.sort(rsCompare)
                    }
                }
                for (let t of b.talents) {
                    character.talents.push(new RenderedTalent(t, { from: 'bio' }))
                }
            }
            character.bio = b
            render()
        }
    }
    vm.bioNote = document.getElementById('bioNote')
    document.getElementById('exportButton').onclick = function () {
        let handle = window.open('preview.html', '_blank')
        if (handle != null) {
            let cns = character.constitution[character.sex]
            let col = character.appearence
            let charData = {
                stats: new Stats(), // see below
                statUps: new Stats(), // see below
                name: character.names.join(' '),
                bio: character?.bio?.name,
                origin: character.origin.name,
                prof: character.prof.name,
                sex: character.sex,
                constitution: cns.description,
                height: cns.height,
                weight: cns.weight,
                ...col,
                age: character.age.n + ' (' + character.age.d + ')',
                marks: character.marks.map(s => s.toLocaleLowerCase()).join(', '),
                baseSkills: [], // see below
                advancedSkills: [], // see below
                talents: [], // see below
                madness: character.madness,
                corrupt: character.corrupt,
                wounds: character.wounds,
                fate: character.fate,
                hand: character.hand,
            }
            Object.keys(vm.stats).forEach(s => {
                let su = character.statUpgrades[s]
                let statValue = character.rolledStats[s] + character.origin.stats[s] + su
                charData.stats[s] = statValue
                charData.statUps[s] = su / 5
            })
            for (let sl of character.skills.values()) {
                let s = sl[sl.length - 1]
                if (s.level == 0 || baseSkills.includes(s.skill)) {
                    charData.baseSkills.push({ name: s.skill.name, level: s.level })
                } else {
                    charData.advancedSkills.push({ name: s.skill.name, level: s.level })
                }
            }
            charData.baseSkills.sort((a, b) => a.name.localeCompare(b.name))
            charData.advancedSkills.sort((a, b) => a.name.localeCompare(b.name))
            let tgs = new Map()
            let sts = []
            var soundConstCount = 0
            for (let rt of character.talents) {
                let t = rt.talent
                if (t.parent === undefined) {
                    let tName = t.name
                    if (tName == sound_constitution.name) {
                        ++soundConstCount
                    } else {
                        sts.push(tName)
                    }
                    if (tName == ambidexter.name) {
                        charData.hand = 'both'
                    }
                } else {
                    let tpn = t.parent.name
                    var subs = tgs.get(tpn)
                    if (subs === undefined) {
                        subs = []
                        tgs.set(tpn, subs)
                    }
                    subs.push(t.specName)
                }
            }
            if (soundConstCount > 0) {
                sts.push(sound_constitution.name + ' (' + soundConstCount + ')')
            }
            if (character.specialTrait !== undefined) {
                charData.talents.push(character.specialTrait)
            }
            if (character.sanctionating !== undefined) {
                let s = character.sanctionating
                charData.talents.push(s.name + ': ' + s.description)
            }
            if (character.bio?.specialNote !== undefined) {
                charData.talents.push(character.bio.specialNote)
            }
            charData.talents.push(...(Array.from(tgs.keys()).sort().map((tg) => tg + ' (' + tgs.get(tg).sort().join(', ') + ')').sort()))
            charData.talents.push(...(sts.sort()))
            let cd = JSON.stringify(charData, null, 2)
            handle.addEventListener('load', () => {
                setTimeout(() => handle.postMessage(cd), 1000)
            })
        }
    }
}

function init() {
    bind()
    randomCharacter()
    render()
    document.getElementById('overlay').style.display = 'none'
    console.log('init called')
}

window.onload = init

// endregion
