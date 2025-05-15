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
            int: frontRoot.getElementById('sSStrV'),
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
            int: [1,2,3,4].map(x => frontRoot.getElementById('sSStru' + x)),
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
            int: backRoot.getElementById('sbSStrV'),
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
            int: [1,2,3,4].map(x => backRoot.getElementById('sbSStru' + x)),
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

function exportToSvg(bound, charData) {

}