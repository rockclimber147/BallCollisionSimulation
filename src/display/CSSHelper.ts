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
}
