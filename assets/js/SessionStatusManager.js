export async function getStatus(){
    let result = await fetch('/api/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    result = await result.json();
    return result;
}

export async function isAuth() {
    let s = await getStatus();
    return s.authenticated;
}

export async function getUser(){
    let s = await getStatus();
    return s.user;
}