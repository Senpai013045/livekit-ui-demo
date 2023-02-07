import {useState} from "react";

const textfields = ["user", "room"] as const;

type InputFields = (typeof textfields)[number];

type State = Record<InputFields, string>;

const initialState: State = {
  user: "",
  room: "",
};

export interface JoinFormProps {
  onSubmit?: (state: State) => void;
}

export const JoinForm = ({onSubmit}: JoinFormProps) => {
  const [formState, setFormState] = useState(initialState);

  const bind = (
    key: keyof typeof formState
  ): React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> => ({
    value: formState[key],
    onChange: e => {
      setFormState(s => ({...s, [key]: e.target.value}));
    },
    placeholder: key,
  });

  return (
    <div className="w-full h-full grid place-items-center text-skype-dark">
      <form
        className="bg-skype-dark-overlay p-10 rounded-lg flex flex-col justify-center items-center gap-4"
        onSubmit={e => {
          e.preventDefault();
          onSubmit?.(formState);
          setFormState(initialState);
        }}
      >
        {textfields.map(key => (
          <div key={key} className="flex gap-2">
            <input className="px-4 py-2" type="text" id={key} {...bind(key)} />
          </div>
        ))}
        <button
          disabled={Object.values(formState).some(v => !v.trim())}
          className="px-4 py-2 text-skype-light border-b-2 inline-block transition-all hover:self-stretch disabled:text-skype-red disabled:border-skype-red disabled:cursor-not-allowed disabled:pointer-events-none"
          type="submit"
        >
          Join
        </button>
      </form>
    </div>
  );
};
