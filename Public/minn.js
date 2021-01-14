
function savestation() {
    let empty = true
    let editedobj = {}
    let val = document.querySelectorAll('.position div input')
    for (let dx = 0; dx < val.length; dx++) {
        if (val[dx].value == '') {
            val[dx].style.borderColor = 'red'
            empty = false
        } else {
            editedobj[val[dx].name] = val[dx].value
            val[dx].style.borderColor = 'gray'
        }
    }
    if (empty) {
        document.querySelector('img').style.display = 'block'
        fetch('/saveedit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editedobj),
        })
            .then(response => response.json())
            .then(data => {
                if (data === 'success') { 
                        window.location.assign('/');                   
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}
