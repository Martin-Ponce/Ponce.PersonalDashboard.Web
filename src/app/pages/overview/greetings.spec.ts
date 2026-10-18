import { GREETING_KEYS, pickGreeting } from './greetings';

describe('pickGreeting', () => {
  beforeEach(() => localStorage.clear());

  it('picks one of the greetings', () => {
    expect(GREETING_KEYS).toContain(pickGreeting());
  });

  it('never repeats the previous greeting', () => {
    let previous = pickGreeting();
    for (let i = 0; i < 50; i++) {
      const next = pickGreeting();
      expect(next).not.toBe(previous);
      previous = next;
    }
  });

  it('can land on any greeting', () => {
    const seen = new Set(
      Array.from({ length: GREETING_KEYS.length }, (_, i) => {
        localStorage.clear();
        return pickGreeting(() => i / GREETING_KEYS.length);
      }),
    );
    expect(seen.size).toBe(GREETING_KEYS.length);
  });

  it('still works when storage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(GREETING_KEYS).toContain(pickGreeting());
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
