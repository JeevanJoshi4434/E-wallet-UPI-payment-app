function verifyTime(date, TTL) {
    const dateObject = new Date(date);
    const expirationTime = dateObject.getTime() + TTL * 1000; // Convert TTL from seconds to milliseconds
    const currentTime = Date.now();

    return currentTime <= expirationTime; // Returns true if the current time is within the TTL period
}


export { verifyTime }