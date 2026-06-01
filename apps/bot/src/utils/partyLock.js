const partyLocks = new Map();

/**
 * Acquires a promise-based lock for a specific party message ID.
 * Resolves to a release function.
 * @param {string} messageId
 * @returns {Promise<() => void>}
 */
function acquireLock(messageId) {
    if (!partyLocks.has(messageId)) {
        partyLocks.set(messageId, Promise.resolve());
    }

    let resolveLock;
    const nextLock = new Promise(resolve => {
        resolveLock = resolve;
    });

    const currentLock = partyLocks.get(messageId);
    partyLocks.set(messageId, nextLock);

    return currentLock.then(() => {
        return () => {
            resolveLock();
            if (partyLocks.get(messageId) === nextLock) {
                partyLocks.delete(messageId);
            }
        };
    });
}

module.exports = {
    acquireLock
};
