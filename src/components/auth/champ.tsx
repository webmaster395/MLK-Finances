import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  libelle: string;
  aide?: string;
};

/** Champ de formulaire de la charte : libellé visible, aide facultative. */
export function Champ({ id, libelle, aide, className = "", ...reste }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-noir">
        {libelle}
      </label>
      <input
        id={id}
        name={id}
        aria-describedby={aide ? `${id}-aide` : undefined}
        className={`min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir placeholder:font-normal placeholder:text-doux ${className}`}
        {...reste}
      />
      {aide ? (
        <p id={`${id}-aide`} className="text-xs">
          {aide}
        </p>
      ) : null}
    </div>
  );
}

/** Message d'erreur ou de confirmation d'un formulaire (lu par les lecteurs d'écran). */
export function MessageFormulaire({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`rounded-md px-3 py-2 text-sm font-semibold ${
        ok ? "bg-accent-clair text-noir" : "bg-orange/15 text-[#8f3306]"
      }`}
    >
      {message}
    </p>
  );
}
