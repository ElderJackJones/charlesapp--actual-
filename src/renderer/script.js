if (!navigator.onLine) {
    window.location.href = 'offline.html'
}

window.addEventListener('offline', () => {
    window.location.href = 'offline.html';
  });

document.addEventListener('alpine:init', () => {
    // Optional: set a default if it's not set elsewhere
    console.log('init')
    Alpine.store('process', false);
    Alpine.store('alerts', [])
    Alpine.store('zones', {})
    Alpine.store('theme', {
        theme: 'lofi',
        isDarkTheme (theme) {
            return ['dark', 'forest', 'dracula', 'night', 'sunset', 'synthwave'].includes(theme);
          }
    }) 
});

const retrieveTheme = async () => {
    const theme = await window.api.getTheme()
    Alpine.store('theme').theme = theme
}

const getNetwork = async () => {
    const strength = await window.api.connectInfo()
    console.log('signal strength = ', strength)
    if (strength < -90) {
        Alpine.store('alerts').push({color: 'alert-danger', content: "😱 Your internet is pretty slow... Be patient or wait for WIFI"})
    } else {
        Alpine.store('alerts').push({color: 'alert-success', content: "You're connected!"})
    }
}

const zones = async () => {
    Alpine.store('zones', [])
    const zones = await window.api.requestZones()
    if (zones) {
        Alpine.store('zones', zones)
    } else {
        Alpine.store('loginError', true)
    }
}

const getReport = async () => {
    Alpine.store('areas', [])
    console.log('requesting report')
    Alpine.store('alerts').push({color: 'alert-info', content: "Don't close the window, this'll take a while... 👉👈"})
    let reportThings
    try {
        reportThings = await window.api.requestReport()
    } catch (e) {
        console.log(e)
    }
    console.log('report\n', reportThings)
    Alpine.store('areas', reportThings)
}




window.api.personBegin((data) => {
    let progress
    if (Alpine.store('process') == 'message') {
        progress = document.getElementById('peeps')
    } else if (Alpine.store('process') == 'test') {
        progress = document.getElementById('peepsTest')
    } else if (Alpine.store('process') == 'custom') {
        progress = document.getElementById('customPeeps')
    }
    progress.value = 0
    progress.max = data

    
    Alpine.store('personInterval', setInterval(() => {
        let helper
        const process = Alpine.store('process')
        if (process === 'message') {
            helper = document.getElementById('peepHelper')
        } else if (process === 'test') {
            helper = document.getElementById('peepHelperTest')
        } else if (process === 'custom') {
            helper = document.getElementById('customPeepsHelper')
        }
        
    }))
})

window.api.personUpdate((data) => {
    let progress
    if (Alpine.store('process') == 'message') {
        progress = document.getElementById('peeps')
    } else if (Alpine.store('process') == 'test') {
        progress = document.getElementById('peepsTest')

    } else if (Alpine.store('process') == 'custom') {
        progress = document.getElementById('customPeeps')
    }
    progress.value = progress.value + 1
})

window.api.personComplete((data) => {
    let helper
    const process = Alpine.store('process')
    if (process === 'message') {
        helper = document.getElementById('peepHelper')
    } else if (process === 'test') {
        helper = document.getElementById('peepHelperTest')
    } else if (process === 'custom') {
        helper = document.getElementById('customPeepsHelper')
    }

    helper.innerHTML = '<i class="bi bi-check"></i> Load people'
})

window.api.httpError((data) => {
    Alpine.store('alerts').push({color: 'alert-danger', content: '💀 Something Critical Died. Try closing, waiting 5 minutes, then trying again.'})
})

window.api.messageBegin((data) => {
    let progress
    if (Alpine.store('process') === 'message') {
        progress = document.getElementById('zoneys')
    } else if (Alpine.store('process') === 'test') {
        progress = document.getElementById('zoneysTest')
    } else if (Alpine.store('process') === 'broadcast') {
        progress = document.getElementById('broadcastBar')
    } else if (Alpine.store('process') === 'custom') {
        progress = document.getElementById('customZoneys')
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
    } else if (Alpine.store('process') === 'custom') {
        progress = document.getElementById('customZoneysHelper')
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
    } else if (Alpine.store('process') === 'custom') {
        helper = document.getElementById('customZoneysHelper')
    }

    helper.innerHTML = '<i class="bi bi-check"></i> Message sent'
    Alpine.store('processComplete', true)
})






const login = async (username, userpassword, botmail, botpass) => {
    const userObj = {
        username: username || null,
        password: userpassword || null,
        botname: botmail || null,
        botpassword: botpass || null,
        theme: Alpine.store('theme').theme
    }
    const worked = await window.api.saveLogin(userObj)
    if (worked) {
        Alpine.store('alerts').push({color: 'alert-success', content: 'Charles has your identity 🥸'})
    } else {
        Alpine.store('alerts').push({color: 'alert-danger', content: worked})
    }
}

const sendZones = async (zones, $data) => {
    const success = await window.api.sendZones(zones)
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
        Alpine.store('process', false)
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
        Alpine.store('process', false)
    } catch (e) {
        console.log(e)
    }
}

const testMessage = async (e2ee, id) => {
    try {
        Alpine.store('process', 'test')
        await window.api.test([e2ee, id])
        Alpine.store('process', false)
    } catch (e) {
        console.log(e)
    }
}

const custom = async (e2ee, msg) => {
    try {
        Alpine.store('process', 'custom')
        await window.api.custom([e2ee, msg])
        Alpine.store('process', false)
    } catch (e) {
        console.log(e)
    }
}