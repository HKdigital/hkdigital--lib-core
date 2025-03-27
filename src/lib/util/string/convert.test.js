describe('kebabToTitleCase', () => {
  it('should convert kebab case to title case', () => {
    expect(kebabToTitleCase('presenter-test')).toBe('Presenter Test');
    expect(kebabToTitleCase('hello-world')).toBe('Hello World');
    expect(kebabToTitleCase('single')).toBe('Single');
    expect(kebabToTitleCase('')).toBe('');
  });
});
