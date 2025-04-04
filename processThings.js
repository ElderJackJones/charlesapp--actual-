import { readFile, readFileSync } from "fs"

let zoneIds = []
let list = readFileSync('node_modules/charlesbrain/resources/people.json')
list = await JSON.parse(list)
for (let person of list.persons) {
    if (!zoneIds.includes(person.findId)) {
        zoneIds.push(person.findId)
    }
}
console.log(zoneIds)