import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUrlDraft } from './useUrlDraft';

function renderDraft(initialApplied: string) {
    return renderHook(({ applied }) => useUrlDraft(applied), { initialProps: { applied: initialApplied } });
}

describe('useUrlDraft', () => {
    it('starts with the applied value', () => {
        const { result } = renderDraft('foo');
        expect(result.current.draft).toBe('foo');
    });

    it('lets the draft change without touching the applied value', () => {
        const { result, rerender } = renderDraft('foo');

        act(() => result.current.setDraft('foob'));
        rerender({ applied: 'foo' });

        expect(result.current.draft).toBe('foob');
    });

    it('adopts an external change', () => {
        const { result, rerender } = renderDraft('foo');

        act(() => result.current.setDraft('typing'));
        rerender({ applied: 'saddle' });

        expect(result.current.draft).toBe('saddle');
    });

    it('ignores the echo of a committed value so further typing survives', () => {
        const { result, rerender } = renderDraft('');

        act(() => result.current.markCommitted('foo'));
        act(() => result.current.setDraft('foo bar'));
        rerender({ applied: 'foo' });

        expect(result.current.draft).toBe('foo bar');
    });

    it('adopts a later external change after an echo', () => {
        const { result, rerender } = renderDraft('');

        act(() => result.current.markCommitted('foo'));
        act(() => result.current.setDraft('foo bar'));
        rerender({ applied: 'foo' });
        rerender({ applied: 'saddle' });

        expect(result.current.draft).toBe('saddle');
    });

    it('adopts a return to a previously committed value once something else came in between', () => {
        const { result, rerender } = renderDraft('');

        act(() => result.current.markCommitted('foo'));
        rerender({ applied: 'foo' });
        rerender({ applied: 'saddle' });
        act(() => result.current.setDraft('typing'));
        rerender({ applied: 'foo' });

        expect(result.current.draft).toBe('foo');
    });

    it('uses isSame so an equal-but-new object is not treated as a change', () => {
        const sameText = (a: { text: string }, b: { text: string }) => a.text === b.text;
        const { result, rerender } = renderHook(({ applied }) => useUrlDraft(applied, sameText), {
            initialProps: { applied: { text: 'Stockholm' } },
        });

        act(() => result.current.setDraft({ text: 'Upps' }));
        rerender({ applied: { text: 'Stockholm' } });
        expect(result.current.draft).toEqual({ text: 'Upps' });

        rerender({ applied: { text: 'Malmö' } });
        expect(result.current.draft).toEqual({ text: 'Malmö' });
    });
});
