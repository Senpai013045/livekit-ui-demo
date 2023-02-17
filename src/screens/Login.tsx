interface Props {
  onSubmit: (username: string) => void;
}

export const LoginScreen = ({onSubmit}: Props) => {
  return (
    <main className="flex-1 flex flex-col gap-10 justify-center items-center">
      <section className="grid place-items-center">
        <img src="./logo.svg" alt="logo" />
      </section>
      <section className="bg-ui-light w-fit rounded-3xl p-16 pb-20">
        <header>
          <h1 className="text-2xl font-semibold text-ui-dark-gray">Welcome Back</h1>
          <p>Enter your username to join the conversation</p>
        </header>
        <form
          className="block mt-12"
          onSubmit={e => {
            e.preventDefault();
            if (e.currentTarget.username instanceof HTMLInputElement) {
              const value = e.currentTarget.username.value;
              if (value) {
                onSubmit(value);
              }
            }
          }}
        >
          <div className="text-md">
            <label className="block font-medium text-ui-dark" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              className="block w-full mt-1 border-2 border-ui-light-gray rounded-md py-2 px-3 focus:outline-none focus:border-ui-dark-gray"
            />
          </div>
          <button
            type="submit"
            className="block w-full mt-8 text-md bg-ui-primary text-ui-light py-2 rounded-md font-medium"
          >
            Log in
          </button>
        </form>
      </section>
    </main>
  );
};
