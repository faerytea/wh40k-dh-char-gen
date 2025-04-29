// region defs

let rollLog = []

function logRoll(res) { rollLog.push(res) }

function d10() {
    let result = Math.floor(Math.random() * 10) + 1
    logRoll(' ' + result)
    return result
}

function d5() {
    let result = Math.floor(d10() / 2)
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

function Prof(
    name,
    skills = [],
    talents = [],
) {
    this.name = name
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

let skills = {
    navigation_land: new Skill("Навигация (наземная)", 'int'),

    awareness: new Skill("Блидтельность", 'per'),
    survival: new Skill("Выживание", 'int'),
    track: new Skill("Выслеживание", 'int'),
    swimming: new Skill("Плавание", 'str'),
    dodge: new Skill("Уклонение", 'dex'),

    drive_land: new Skill("Вождение (наземный)", 'dex'),
    
    language_gothic_low: new Skill("Язык (Низкий Готик)", 'int'),
    language_tribal: new Skill("Язык (племенной диалект)", 'int'),
    language_local_dusk: new Skill("Язык (диалект Даска)", 'int'),

    lore_forbidden_demonology: new Skill("Запретное знание (демонология)", 'int'),
    lore_scholastic_occult: new Skill("Учёное знание (оккультизм)", 'int'),
    lore_common_dusk: new Skill("Обыденное знание (фольклор Даска)", 'int'),
}

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

let profs = {
    adept: new Prof('Адепт'),
    judge: new Prof('Арбитр'),
    killer: new Prof(
        'Убийца',
        [
            skills.awareness,
            skills.dodge,
            skills.language_gothic_low,
        ],
        [
            talents.weapon_cqc_prim,
            [talents.ambidexter, talents.unremarcable],
            [talents.weapon_throw, talents.weapon_hand_laz],
            talents.weapon_main_stub,
            talents.weapon_hand_stub,
        ]
    ),
    cleric: new Prof('Клирик'),
    guard: new Prof(
        'Гвардеец',
        [
            skills.language_gothic_low,
            [skills.drive_land, skills.swimming],
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

let origins = function () {
    let wild = new Origin(
        "Дикий мир",
        new Stats(20, 20, 25, 25, 20, 20, 20, 15, 15),
        [
            new RollableOption(profs.killer, 1, 30),
            new RollableOption(profs.guard, 31, 80),
            new RollableOption(profs.psy, 81, 90),
            new RollableOption(profs.scum, 91, 100),
        ],
        [
            [skills.navigation_land, skills.survival, skills.track],
            [skills.language_tribal],
        ],
        [
            talents.iron_guts,
            talents.savage,
            talents.init_rites,
        ],
        new SecondaryMods(),
        9, 
        [
            new RollableOption(1, 1, 4),
            new RollableOption(2, 5, 10),
        ],
        mkConstVariants(
            "поджарый", 190, 65, "поджарая", 180, 60,
            "тощий", 175, 60, "тощая", 165, 55,
            "мускулистый", 185, 85, "мускулистая", 170, 70,
            "коренастый", 165, 80, "коренастая", 155, 70,
            "здоровенный", 210, 120, "здоровенная", 200, 100
        ),
        [
            new RollableOption(new Age("Воин", 15), 1, 70),
            new RollableOption(new Age("Старейшина", 25), 71, 100),
        ],
        mkAppearences(
            "тёмная", "рыжие", "голубые",
            "загорелая", "светлые", "серые",
            "светлая", "русые", "карие",
            "красная", "чёрные", "зелёные",
            "бронзовая", "седые", "жёлтые",
        ),
        mkMarks(
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
    )
    let wild_dusk = new Origin(
        "Дикий мир (Даск)",
        wild.stats.copy({'wil': +3, 'per': +3}),
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
            idf,
            x => { return x + d5() },
            x => { return x + d5() },
            x => { return x - 1 }
        ),
        wild.baseWounds,
        wild.fateChances,
        wild.constitutions,
        wild.ages,
        wild.appearences,
        wild.marks,
    )
    return {
        'wild': wild,
        'wild_dusk': wild_dusk,
    }
}()

let rollableOrigins = [
    new RollableOption(origins.wild, 1, 15)
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
    rolledStats: new Stats()
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

let vm = {}

function render() {
    if (character.rolledStats !== undefined && character.origin != undefined) {
        Object.keys(vm.stats).forEach(s => {
            vm.stats[s].innerText = String(character.rolledStats[s] + character.origin.stats[s])
        })
    }
    let renderSkills = vm.renderSkills
    if (renderSkills !== undefined && character.skills !== undefined) {
        renderSkills(character.skills)
    }
    let renderTalents = vm.renderTalents
    if (renderTalents !== undefined && character.talents !== undefined) {
        renderTalents(character.talents)
    }
    delayed.innerHTML = ''
    function renderDelayed(del, norm, mk) {
        if (del !== undefined) {
            for (let i = 0; i < del.length; ++i) {
                let li = document.createElement('li')
                let ds = del[i]
                for (let s of ds.lst) {
                    let opt = document.createElement('div')
                    opt.innerText = s.name
                    opt.onclick = function () {
                        norm.push(mk(s, ds.from, ds.ix))
                        del.splice(i, 1)
                        render()
                    }
                    li.append(opt)
                }
                delayed.append(li)
            }
        }
    }
    renderDelayed(character.delayedSkills, character.skills, (s, from, ix) => new RenderedSkill(s, 1, { from: from, ix: ix }))
    renderDelayed(character.delayedTalents, character.talents, (s, from, ix) => new RenderedTalent(s, { from: from, ix: ix }))
    vm.woundSpan.innerText = String(character.wounds)
    vm.fateSpan.innerText = String(character.fate)
    vm.corruptSpan.innerText = String(character.corrupt)
    vm.madnessSpan.innerText = String(character.madness)
    vm.sexBox.value = character.sex
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
    vm.rollLog.innerText = rollLog.join('')
}

function buildCharacter() {
    console.log('build character')
    let o = character.origin
    let p = character.prof
    character.skills = []
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
                character.skills = []
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
        for (let r of toRender) {
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
                        character.skills.splice(character.skills.findIndex(x => x.skill.name == r.skill.name && x.level == r.level), 1)
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
                        character.skills.splice(character.skills.findIndex(x => x.skill.name == r.skill.name && x.level == r.level), 1)
                        character.delayedSkills.push({ lst: s, from: 'prof', ix: ix })
                        render()
                    }
                } else {
                    sOrigin.innerText = 'Профессия'
                }
            } else if (o.from == 'buy') {
                sOrigin.innerText = o.cost + ' ОО'
            }
            row.append(sName, s00, s10, s20, sOrigin)
            skillBox.append(row)
        }
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
