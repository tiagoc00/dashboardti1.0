// src/components/atoms/Button.js
export const Button = ({ id = '', text, variant = 'primary', extraClasses = '', attrs = '' }) => {
  const base = 'font-mono text-[13px] font-bold rounded-lg px-4 py-3 transition-all outline-none focus:ring-2 focus:ring-cyan/50';
  const variants = {
    primary: 'bg-cyan text-[#E8E1D0] hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed w-full mt-2',
    secondary: 'bg-transparent border border-border2 text-muted hover:border-cyan hover:text-cyan w-full flex items-center justify-center gap-2',
    logout: 'bg-transparent border-none text-muted text-[16px] p-1 hover:text-red cursor-pointer',
    tab: 'bg-transparent border border-border rounded-md text-muted text-[11px] font-mono px-3 py-1.5 cursor-pointer transition-all hover:border-border2'
  };
  return `<button ${id ? `id="${id}"` : ''} class="${base} ${variants[variant]||''} ${extraClasses}" ${attrs}>${text}</button>`;
}

// src/components/atoms/Input.js
export const Input = ({ id, label, type = 'text', placeholder = '', attrs = '' }) => {
  return `
    <div class="flex flex-col gap-1.5 mb-4">
      <label class="text-[11px] text-muted tracking-wide uppercase">${label}</label>
      <input type="${type}" id="${id}" placeholder="${placeholder}" class="bg-surface border border-border2 rounded-lg text-text font-sans text-[14px] px-3.5 py-3 outline-none focus:border-cyan transition-colors w-full" ${attrs} />
    </div>
  `;
}
