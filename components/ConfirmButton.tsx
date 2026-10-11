'use client';

/** Botón de formulario que pide confirmación antes de enviar. */
export default function ConfirmButton({ message, children, className = 'btn danger sm' }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
