export class CSSHelper {
  public static show(element: HTMLElement): void {
    element.style.display = '';
  }

  public static hide(element: HTMLElement): void {
    element.style.display = 'none';
  }

  public static toggle(element: HTMLElement): void {
    if (element.style.display === 'none' || element.style.display === '') {
      this.show(element);
    } else {
      this.hide(element);
    }
  }

  public static addStyle(element: HTMLElement, style: string) {
    element.setAttribute('style', (element.getAttribute('style') ?? '') + style);
  }

  public static removeStyle(element: HTMLElement, style: string) {
    const currentStyle = element.getAttribute('style') ?? '';
    const updatedStyle = currentStyle
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s && !style.includes(s))
      .join('; ');
    element.setAttribute('style', updatedStyle ? `${updatedStyle};` : '');
  }

  public static hasStyle(element: HTMLElement, style: string): boolean {
    const [key, value] = style.split(':').map((s) => s.trim());
    if (!key || !value) return false;

    const inlineStyles = element.getAttribute('style') ?? '';
    const styleMap = new Map(
      inlineStyles
        .split(';')
        .map((rule) => rule.trim())
        .filter(Boolean)
        .map((rule) => {
          const [k, v] = rule.split(':').map((s) => s.trim());
          return [k, v];
        })
    );

    return styleMap.get(key) === value;
  }
}
