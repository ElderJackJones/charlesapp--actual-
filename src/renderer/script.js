document.addEventListener('alpine:init', async () => {
    Alpine.store('zones', [])
    const zones = await window.api.requestZones()
    if (zones) {
        Alpine.store('zones', zones)
    } else {
        Alpine.store('loginError', true)
    }

    
})

window.api.personBegin((data) => {
    const progress = document.getElementById('peeps')
    progress.value = 0
    progress.max = data
})

window.api.personUpdate((data) => {
    const progress = document.getElementById('peeps')
    progress.value = progress.value + 1
})

window.api.personComplete((data) => {
    const helper = document.getElementById('peepHelper')
    helper.textContent = 'Load people'
    helper.classList.add('is-primary')
})

window.api.messageBegin((data) => {
    const progress = document.getElementById('zoneys')
    progress.value = 0
    progress.max = data
})
window.api.messageSent((data) => {
    const progress = document.getElementById('zoneys')
    progress.value = progress.value + 1
})
window.api.messageComplete((data) => {
    const helper = document.getElementById('zoneysHelper')
    helper.textContent = 'Message sent'
    helper.classList.add('is-success')
})






const login = async (username, userpassword, botmail, botpass, $data) => {
    console.log($data)
    const userObj = {
        username: username,
        password: userpassword,
        botname: botmail,
        botpassword: botpass
    }
    const worked = await window.api.saveLogin(userObj)
    if (worked) {
        $data.notification.classes = 'notification is-success'
        $data.showNotification('<strong>Login Saved!</strong>') 
    } else {
        $data.notification.classes = 'notification is-danger'
        $data.showNotification('<strong>Login not saved due to error!</strong>') 
    }
}

const sendZones = async (zones, $data) => {
    console.log('before success')
    const success = await window.api.sendZones(zones)
    console.log('after success')
    if (success) {
        $data.notification.classes = 'notification is-success'
        $data.showNotification('<strong>Charles is looking over your little ID eggs</strong>') 
    } else {
        $data.notification.classes = 'notification is-danger'
        $data.showNotification("<strong>😱 #askedForAFish--gotASerpent </strong>") 
    }
}

const charlesMessage = async () => {
    try {
        await window.api.charles()
    } catch (e) {
        console.log(e)
    }
    
}
