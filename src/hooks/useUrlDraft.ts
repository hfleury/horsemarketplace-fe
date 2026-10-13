import { useState } from 'react';

/**
 * Keeps an editable draft of a value that lives in the URL. The draft follows the applied value
 * whenever it changes from outside (e.g. a Header search), but ignores the echo of a value this
 * component just committed via markCommitted, so in-progress typing survives the round-trip.
 */
export function useUrlDraft<T>(appliedValue: T, isSame: (a: T, b: T) => boolean = Object.is) {
    const [draft, setDraft] = useState(appliedValue);
    const [seenAppliedValue, setSeenAppliedValue] = useState(appliedValue);
    const [pendingCommit, setPendingCommit] = useState<{ value: T } | null>(null);

    // Adjusting state during render rather than in an effect, as React recommends for derived resets.
    if (!isSame(appliedValue, seenAppliedValue)) {
        setSeenAppliedValue(appliedValue);
        setPendingCommit(null);
        const isEchoOfCommit = pendingCommit !== null && isSame(appliedValue, pendingCommit.value);
        if (!isEchoOfCommit) setDraft(appliedValue);
    }

    const markCommitted = (value: T) => setPendingCommit({ value });

    return { draft, setDraft, markCommitted };
}
