import { loadScriptTags } from '../load-script-tags';

describe('loadScriptTags method', () => {
  const mockTag = '<script src="https://moat.com/script.js"></script>';
  const mockTagWithAttributes =
    '<script src="https://moat.com/script-with-attr.js" aria-title="MOAT Analytics"></script>';
  const createElementSpy = jest.spyOn(document, 'createElement');
  const querySelectorSpy = jest.spyOn(document, 'querySelector');

  afterEach(() => {
    const head = document.querySelector('head') as HTMLHeadElement;
    const scripts = head.querySelectorAll('script') as NodeList;
    for (let i = 0; i < scripts.length; ++i) {
      head.removeChild(scripts[i]);
    }
  });

  it('should do nothing if no scripts are provided', () => {
    loadScriptTags(null as unknown as string[]);
    loadScriptTags([]);

    expect(createElementSpy).not.toHaveBeenCalled();
  });

  it('should do nothing if for some crazy af reason the document has no head element', () => {
    querySelectorSpy.mockImplementationOnce(() => null);

    loadScriptTags([mockTag]);

    expect(createElementSpy).not.toHaveBeenCalled();
  });

  it('should create HTML elements and append them to the head element', () => {
    loadScriptTags([mockTag]);

    const head = document.querySelector('head') as HTMLHeadElement;
    const script = head.querySelector('script') as HTMLScriptElement;
    expect(script).not.toBe(undefined);
    expect(script.src).toBe('https://moat.com/script.js');
  });

  it('should keep all attributes in place', () => {
    loadScriptTags([mockTagWithAttributes]);

    const head = document.querySelector('head') as HTMLHeadElement;
    const script = head.querySelector('script') as HTMLScriptElement;
    expect(script).not.toBe(undefined);
    expect(script.src).toBe('https://moat.com/script-with-attr.js');
    expect(script.getAttribute('aria-title')).toBe('MOAT Analytics');
  });

  it('should clone inline content as well', () => {
    loadScriptTags(['<script>var INLINE_CONTENT;</script>']);

    const head = document.querySelector('head') as HTMLHeadElement;
    const script = head.querySelector('script') as HTMLScriptElement;
    expect(script).not.toBe(undefined);
    expect(script.innerHTML.toString()).toBe('var INLINE_CONTENT;');
  });

  it('should handle more than one script', () => {
    loadScriptTags([mockTag, mockTagWithAttributes]);

    const head = document.querySelector('head') as HTMLHeadElement;
    const scripts = head.querySelectorAll('script') as NodeList;
    expect(scripts).not.toBe(undefined);
    expect((scripts[0] as HTMLIFrameElement).src).toBe(
      'https://moat.com/script.js'
    );
    expect((scripts[1] as HTMLIFrameElement).src).toBe(
      'https://moat.com/script-with-attr.js'
    );
    expect((scripts[1] as HTMLIFrameElement).getAttribute('aria-title')).toBe(
      'MOAT Analytics'
    );
  });
});
