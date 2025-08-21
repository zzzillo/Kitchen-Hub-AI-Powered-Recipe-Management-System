import InputRecipe from "@/components/InputRecipe";

function CreateRecipepage () {

    const createRecipe = (data) => {
        //call api to save
    }

    

    return (
        <div>
            <InputRecipe onSave={createRecipe}/>
        </div>
    )
}

export default CreateRecipepage;