function bindSvg(frontRoot, backRoot) {
    return {
        name: frontRoot.getElementById('sCharName'),
        origin: frontRoot.getElementById('sOrigin'),
        prof: frontRoot.getElementById('sProf'),
        sex: frontRoot.getElementById('sSex'),
        constitution: frontRoot.getElementById('sConst'),
        height: frontRoot.getElementById('sHeight'),
        weight: frontRoot.getElementById('sWeight'),
        skin: frontRoot.getElementById('sSkin'),
        hair: frontRoot.getElementById('sHair'),
        eyes: frontRoot.getElementById('sEyes'),
        age: frontRoot.getElementById('sAge'),
        marks: frontRoot.getElementById('sMarks'),
        divination: frontRoot.getElementById('sDivination'),
        stats: {
            cqc: frontRoot.getElementById('sSHtHV'),
            rc:  frontRoot.getElementById('sSRCV'),
            str: frontRoot.getElementById('sSStrV'),
            con: frontRoot.getElementById('sSConV'),
            dex: frontRoot.getElementById('sSDexV'),
            int: frontRoot.getElementById('sSIntV'),
            per: frontRoot.getElementById('sSPerV'),
            wil: frontRoot.getElementById('sSWilV'),
            cha: frontRoot.getElementById('sSFelV'),
        },
        statUpgrades: {
            cqc: [1,2,3,4].map(x => frontRoot.getElementById('sSHtHu' + x)),
            rc:  [1,2,3,4].map(x => frontRoot.getElementById('sSRCu' + x)),
            str: [1,2,3,4].map(x => frontRoot.getElementById('sSStru' + x)),
            con: [1,2,3,4].map(x => frontRoot.getElementById('sSConu' + x)),
            dex: [1,2,3,4].map(x => frontRoot.getElementById('sSDexu' + x)),
            int: [1,2,3,4].map(x => frontRoot.getElementById('sSIntu' + x)),
            per: [1,2,3,4].map(x => frontRoot.getElementById('sSPeru' + x)),
            wil: [1,2,3,4].map(x => frontRoot.getElementById('sSWilu' + x)),
            cha: [1,2,3,4].map(x => frontRoot.getElementById('sSFelu' + x)),
        },
        baseSkills: [...frontRoot.getElementById('sBaseSkills').children].map(l => {
            let ch = l.children
            return {
                name: ch[0],
                levels: [ch[1], ch[2], ch[3]],
            }
        }),
        advancedSkills: [...frontRoot.getElementById('sAdvancedSkills').children].map(l => {
            let ch = l.children
            return {
                name: ch[0],
                levels: [ch[1], ch[2], ch[3]],
            }
        }),
        talents: [...frontRoot.getElementById('sTalents').children].filter(x => x.tagName == 'text'),
        items: [...frontRoot.getElementById('sItems').children].filter(x => x.tagName == 'text'),
        wealth: frontRoot.getElementById('sWealth'),
        income: frontRoot.getElementById('sIncome'),
        bio: frontRoot.getElementById('sBio'),
        statsBack: {
            cqc: backRoot.getElementById('sbSHtHV'),
            rc:  backRoot.getElementById('sbSRCV'),
            str: backRoot.getElementById('sbSStrV'),
            con: backRoot.getElementById('sbSConV'),
            dex: backRoot.getElementById('sbSDexV'),
            int: backRoot.getElementById('sbSIntV'),
            per: backRoot.getElementById('sbSPerV'),
            wil: backRoot.getElementById('sbSWilV'),
            cha: backRoot.getElementById('sbSFelV'),
        },
        statUpgradesBack: {
            cqc: [1,2,3,4].map(x => backRoot.getElementById('sbSHtHu' + x)),
            rc:  [1,2,3,4].map(x => backRoot.getElementById('sbSRCu' + x)),
            str: [1,2,3,4].map(x => backRoot.getElementById('sbSStru' + x)),
            con: [1,2,3,4].map(x => backRoot.getElementById('sbSConu' + x)),
            dex: [1,2,3,4].map(x => backRoot.getElementById('sbSDexu' + x)),
            int: [1,2,3,4].map(x => backRoot.getElementById('sbSIntu' + x)),
            per: [1,2,3,4].map(x => backRoot.getElementById('sbSPeru' + x)),
            wil: [1,2,3,4].map(x => backRoot.getElementById('sbSWilu' + x)),
            cha: [1,2,3,4].map(x => backRoot.getElementById('sbSFelu' + x)),
        },
        wounds: backRoot.getElementById('sbWounds'),
        fate: backRoot.getElementById('sbFate'),
        madness: backRoot.getElementById('sbMadness'),
        corrupt: backRoot.getElementById('sbCorrupt'),
        setStat: function(stat, value, upgradeCount = 0) {
            this.stats[stat].innerHTML = value
            this.statsBack[stat].innerHTML = value
            for (let i = 0; i < 4; ++i) {
                let c = i < upgradeCount ? '#000' : 'none'
                this.statUpgrades[stat][i].setAttribute('fill', c)
                this.statUpgradesBack[stat][i].setAttribute('fill', c)
            }
        },
    }
}

function fillSkill(onLine, name, level = 0) {
    let sl = onLine
    sl.name.innerHTML = name
    for (let l = 0; l < 3; ++l) {
        sl.levels[l].setAttribute('fill', l < level ? '#000' : 'none')
    }
}

function fillSkillColumn(lines, skills) {
    for (let i = 0; i < skills.length; ++i) {
        fillSkill(lines[i], skills[i].name, skills[i].level)
    }
}

function exportToSvg(bound, charData) {
    let mks = s => s === undefined ? '' : String(s)
    bound.name.innerHTML = mks(charData.name)
    bound.origin.innerHTML = mks(charData.origin)
    bound.prof.innerHTML = mks(charData.prof)
    bound.sex.innerHTML = (charData.sex == 'male') ? 'Муж' : (charData.sex == 'female') ? 'Жен' : ''
    bound.constitution.innerHTML = mks(charData.constitution)
    bound.height.innerHTML = mks(charData.height)
    bound.weight.innerHTML = mks(charData.weight)
    bound.hair.innerHTML = mks(charData.hair)
    bound.skin.innerHTML = mks(charData.skin)
    bound.eyes.innerHTML = mks(charData.eyes)
    bound.age.innerHTML = mks(charData.age)
    bound.marks.innerHTML = mks(charData.marks)
    bound.divination.innerHTML = mks(charData.divination)

    bound.madness.innerHTML = mks(charData.madness)
    bound.corrupt.innerHTML = mks(charData.corrupt)
    bound.wounds.innerHTML = mks(charData.wounds)
    bound.fate.innerHTML = mks(charData.fate)

    if (charData.stats !== undefined && charData.statUps !== undefined) {
        for (let s of Object.keys(charData.stats)) {
            let sv = charData.stats[s]
            let su = charData.statUps[s]
            bound.setStat(s, sv, su)
        }
    }

    if (charData.baseSkills !== undefined) {
        fillSkillColumn(bound.baseSkills, charData.baseSkills)
    }
    if (charData.advancedSkills !== undefined) {
        fillSkillColumn(bound.advancedSkills, charData.advancedSkills)
    }
    var tli = 0
    let revTalents = charData.talents.toReversed()
    let maxW = bound.talents[0].parentElement.getClientRects()[0].width
    console.log('maxW: ' + maxW)
    while (revTalents.length > 0) {
        let t = revTalents.pop()
        let tl = bound.talents[tli]
        tl.innerHTML = t
        console.log(tli + ': ' + tl.getClientRects()[0].width)
        if (tl.getClientRects()[0].width > maxW) {
            var unfeed = ''
            do {
                let txt = tl.innerHTML
                let splitPoint = txt.lastIndexOf(' ')
                unfeed = txt.substring(splitPoint + 1) + ' ' + unfeed
                tl.innerHTML = txt.substring(0, splitPoint)
            } while (tl.getClientRects()[0].width > maxW)
            revTalents.push(unfeed.trimEnd())
        }
        ++tli
    }
}