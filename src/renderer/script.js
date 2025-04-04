const zones = async () => {
    Alpine.store('zones', [])
    const zones = await window.api.requestZones()
    if (zones) {
        Alpine.store('zones', zones)
    } else {
        Alpine.store('loginError', true)
    }
}

document.addEventListener('alpine:init', async () => {
    Alpine.store('zones', [])
    await zones()  
})

const getReport = async () => {
    Alpine.store('areas', [])
    console.log('requesting report')
    const reportThings = await window.api.requestReport()
    console.log('report\n', reportThings)
    Alpine.store('areas', reportThings)
}




window.api.personBegin((data) => {
    let progress = document.getElementById('peeps')
    if (!progress.checkVisibility()) {
        progress = document.getElementById('peepsTest')
    }
    progress.value = 0
    progress.max = data
})

window.api.personUpdate((data) => {
    let progress = document.getElementById('peeps')
    if (!progress.checkVisibility()) {
        progress = document.getElementById('peepsTest')
    }
    progress.value = progress.value + 1
})

window.api.personComplete((data) => {
    let helper = document.getElementById('peepHelper')
    if (!helper.checkVisibility()) {
        helper = document.getElementById('peepHelperTest')
    }
    helper.innerHTML = '<i class="bi bi-check"></i> Load people'
})

window.api.messageBegin((data) => {
    let progress
    if (Alpine.store('process') === 'message') {
        progress = document.getElementById('zoneys')
    } else if (Alpine.store('process') === 'test') {
        progress = document.getElementById('zoneysTest')
    } else if (Alpine.store('process') === 'broadcast') {
        progress = document.getElementById('broadcastBar')
    } else {
        console.error('No open modal :(')
    }

    progress.value = 0
    progress.max = data * 100
})
window.api.messageSent(async (data) => {
    let progress
    if (Alpine.store('process') === 'message') {
        progress = document.getElementById('zoneys')
    } else if (Alpine.store('process') === 'test') {
        progress = document.getElementById('zoneysTest')
    } else if (Alpine.store('process') === 'broadcast') {
        progress = document.getElementById('broadcastBar')
    } else {
        console.error('No open modal :(')
    }
    for (let i = 0; i < 100; i++) {
        progress.value = progress.value + 1
        await new Promise((r) => setTimeout(r, 8))
    }
})
window.api.messageComplete((data) => {
    let helper
    if (Alpine.store('process') === 'message') {
        helper = document.getElementById('zoneysHelper')
    } else if (Alpine.store('process') === 'test') {
        helper = document.getElementById('zoneysHelperTest')
    } else if (Alpine.store('process') === 'broadcast') {
        helper = document.getElementById('broadcastMessage')
    } else {
        console.error('No open modal :(')
    }

    helper.innerHTML = '<i class="bi bi-check"></i> Message sent'
    Alpine.store('processComplete', true)
})






const login = async (username, userpassword, botmail, botpass, $data) => {
    const userObj = {
        username: username,
        password: userpassword,
        botname: botmail,
        botpassword: botpass
    }
    const worked = await window.api.saveLogin(userObj)
    if (worked) {
        Alpine.store('alerts').push({color: 'alert-success', content: 'Charles has your identity 🥸'})
    } else {
        Alpine.store('alerts').push({color: 'alert-danger', content: 'Something died...'})
    }
}

const sendZones = async (zones, $data) => {
    console.log('before success')
    const success = await window.api.sendZones(zones)
    console.log('after success')
    if (success) {
        Alpine.store('alerts').push({color: 'alert-success', content: 'Charles is looking over your little ID eggs'})
    } else {
        Alpine.store('alerts').push({color: 'alert-danger', content: "😱 #askedForAFish--gotASerpent"})
    }
}

const charlesMessage = async (e2ee) => {
    try {
        Alpine.store('process', 'message')
        await window.api.charles(e2ee)
    } catch (e) {
        console.log(e)
    }
    
}

const addToClipboard = async (arrayOfStrings, search) => {
    console.log(search)
    let message = ""
    for (let area of arrayOfStrings) {
        if (search) {
            if (area.toLowerCase().includes(search.toLowerCase())) {
                message += area
                message += "\n"
                continue
            } else {
                continue
            }
        }
        else {
        message += area 
        message += "\n"
        }
    }
    await navigator.clipboard.writeText(message)
}

const closeIt = () => {
    window.api.closeWindow()
}

const broadcastSend = async (e2ee, msg) => {
    try {
        Alpine.store('process', 'broadcast')
        await window.api.broadcast([e2ee, msg])
    } catch (e) {
        console.log(e)
    }
}

const testMessage = async (e2ee, id) => {
    try {
        Alpine.store('process', 'test')
        await window.api.test([e2ee, id])
    } catch (e) {
        console.log(e)
    }
}