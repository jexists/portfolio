import '@testing-library/jest-dom/vitest';

// jsdom 은 <dialog> 의 showModal/close 와 요소 scrollTo 를 구현하지 않는다
// node 환경 테스트(계약 검사)에는 DOM 이 없다
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  Element.prototype.scrollTo ??= () => {};
}
