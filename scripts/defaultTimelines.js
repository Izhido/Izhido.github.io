const defaultTimelines = new Map([
    ["player.mdl", [
        { first: 0, last: 5 },
        { first: 6, last: 11 },
        { first: 12, last: 16 },
        { first: 17, last: 28 },
        { first: 29, last: 34 },
        { first: 35, last: 40 },
        { first: 41, last: 49 },
        { first: 50, last: 60 },
        { first: 61, last: 69 },
        { first: 70, last: 84 },
        { first: 85, last: 93 },
        { first: 94, last: 102 },
        { first: 103, last: 104 },
        { first: 105, last: 106 },
        { first: 107, last: 112 },
        { first: 113, last: 118 },
        { first: 119, last: 124 },
        { first: 125, last: 130 },
        { first: 131, last: 136 },
        { first: 137, last: 142 }
    ]],
    ["soldier.mdl", [
        { first: 0, last: 7 },
        { first: 8, last: 17 },
        { first: 18, last: 28 },
        { first: 29, last: 39 },
        { first: 40, last: 45 },
        { first: 46, last: 59 },
        { first: 60, last: 72 },
        { first: 73, last: 80 },
        { first: 81, last: 89 },
        { first: 90, last: 113 }
    ]],
    ["dog.mdl", [
        { first: 0, last: 7 },
        { first: 8, last: 16 },
        { first: 17, last: 25 },
        { first: 26, last: 31 },
        { first: 32, last: 47 },
        { first: 48, last: 59 },
        { first: 60, last: 68 },
        { first: 69, last: 77 },
        { first: 78, last: 85 }
    ]],
    ["ogre.mdl", [
        { first: 0, last: 8 },
        { first: 9, last: 24 },
        { first: 25, last: 32 },
        { first: 33, last: 46 },
        { first: 47, last: 60 },
        { first: 61, last: 66 },
        { first: 67, last: 71 },
        { first: 72, last: 74 },
        { first: 75, last: 80 },
        { first: 81, last: 96 },
        { first: 97, last: 111 },
        { first: 112, last: 125 },
        { first: 126, last: 135 },
        { first: 136, last: 146 }
    ]],
    ["knight.mdl", [
        { first: 0, last: 8 },
        { first: 9, last: 16 },
        { first: 17, last: 27 },
        { first: 28, last: 30 },
        { first: 31, last: 41 },
        { first: 42, last: 52 },
        { first: 53, last: 66 },
        { first: 67, last: 71 },
        { first: 72, last: 75 },
        { first: 76, last: 85 },
        { first: 86, last: 96 }
    ]],
    ["demon.mdl", [
        { first: 0, last: 12 },
        { first: 13, last: 20 },
        { first: 21, last: 26 },
        { first: 27, last: 38 },
        { first: 39, last: 44 },
        { first: 45, last: 53 },
        { first: 54, last: 68 }
    ]],
    ["wizard.mdl", [
        { first: 0, last: 14 },
        { first: 15, last: 28 },
        { first: 29, last: 41 },
        { first: 42, last: 45 },
        { first: 46, last: 53 }
    ]],
    ["zombie.mdl", [
        { first: 0, last: 14 },
        { first: 15, last: 33 },
        { first: 34, last: 51 },
        { first: 52, last: 64 },
        { first: 65, last: 78 },
        { first: 79, last: 90 },
        { first: 91, last: 102 },
        { first: 103, last: 130 },
        { first: 131, last: 148 },
        { first: 149, last: 161 },
        { first: 162, last: 191 },
        { first: 192, last: 197 }
    ]],
    ["shambler.mdl", [
        { first: 0, last: 16 },
        { first: 17, last: 28 },
        { first: 29, last: 34 },
        { first: 35, last: 46 },
        { first: 47, last: 55 },
        { first: 56, last: 64 },
        { first: 65, last: 76 },
        { first: 77, last: 82 },
        { first: 83, last: 93 }
    ]],
    ["boss.mdl", [
        { first: 0, last: 16 },
        { first: 17, last: 47 },
        { first: 48, last: 56 },
        { first: 57, last: 79 },
        { first: 80, last: 89 },
        { first: 90, last: 95 },
        { first: 96, last: 105 }
    ]],
    ["enforcer.mdl", [
        { first: 0, last: 6 },
        { first: 7, last: 22 },
        { first: 23, last: 30 },
        { first: 31, last: 40 },
        { first: 41, last: 54 },
        { first: 55, last: 65 },
        { first: 66, last: 69 },
        { first: 70, last: 74 },
        { first: 75, last: 82 },
        { first: 83, last: 101 }
    ]],
    ["fish.mdl", [
        { first: 0, last: 17 },
        { first: 18, last: 38 },
        { first: 39, last: 56 },
        { first: 57, last: 65 }
    ]],
    ["hknight.mdl", [
        { first: 0, last: 8 },
        { first: 9, last: 28 },
        { first: 29, last: 36 },
        { first: 37, last: 41 },
        { first: 42, last: 53 },
        { first: 54, last: 62 },
        { first: 63, last: 78 },
        { first: 79, last: 92 },
        { first: 93, last: 105 },
        { first: 106, last: 111 },
        { first: 112, last: 121 },
        { first: 122, last: 132 },
        { first: 133, last: 154 },
        { first: 155, last: 165 }
    ]],
    ["tarbaby.mdl", [
        { first: 0, last: 24 },
        { first: 25, last: 49 },
        { first: 50, last: 55 },
        { first: 56, last: 59 },
        { first: 60, last: 60 }
    ]],
    ["shalrath.mdl", [
        { first: 0, last: 10 },
        { first: 11, last: 15 },
        { first: 16, last: 22 },
        { first: 23, last: 34 }
    ]],
    ["oldone.mdl", [
        { first: 0, last: 45 },
        { first: 46, last: 66 }
    ]]
])