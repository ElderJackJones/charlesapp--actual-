document.addEventListener('alpine:init', () => {
    Alpine.store('zones', [])
    setTimeout(() => {
        Alpine.store('zones', ['Charleston', 'SML', 'etc'])
    }, 10000)
})