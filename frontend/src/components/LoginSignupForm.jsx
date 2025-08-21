function LoginSignupForm({buttonText, onSubmit}) {

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        onSubmit({username,password});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='flex items-center justify-center flex-col w-84 lg:w-120'>
                <div className='flex items-center justify-center pt-8'>
                    <h1 className='text-3xl text-green font-bold text-center'>Recipe Management System</h1>
                </div>
                <div className='mt-15'>
                    <p className='text-xl'>Username</p>
                    <div className='flex items-center justify-center'>
                        <input type='text' name='username' className='h-15 w-72 text-xl rounded-md border-3 border-green bg-white focus:outline-0 shadow-none lg:w-96'></input>
                    </div>
                </div>
                <div className='mt-6'>
                    <p className='text-xl'>Password</p>
                    <input type='password' name='password' className='h-15 w-72 text-xl rounded-md border-3 border-green bg-white focus:outline-0 shadow-none lg:w-96'></input>
                </div>
                <div className='flex items-center justify-center mt-16'>
                    <button type='submit' className='h-15 w-60 text-2xl bg-green text-white rounded-md hover:bg-green-800 hover:scale-105 active:bg-green-900 active:scale-95 focus:outline-none focus:ring-2 focus:outline-0 shadow-none transition-all duration-200'>{buttonText}</button>
                </div>
            </div>
        </form>
    )
}

export default LoginSignupForm;