import LogoTitle from '../components/LogoTitle';
import SearchBar from '../components/SearchBar';
import AddRecipeButton from '../components/AddRecipeButton';
import RecipeCard from '../components/RecipeCard';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage () {

    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [recipes, setRecipes] = useState([
        {   
            id: 1,
            src: '/recipe_images/Adobo.jpg',
            title: 'Pork Adobo',
            desc: 'A classic Filipino dish made with pork braised in soy sauce fawdkawdmalfmamkwdmawdmawdmamwlm frfj' ,
            time: '4H', 
            category: 'Main Dish',
            tags: ['Filipino', 'Pork', 'Savory','Filipino', 'Pork', 'Savory','Filipino', 'Pork', 'Savory','Filipino', 'Pork', 'Savory'],
        },
        {   
            id: 2,
            src: '../assets/Adobo.jpg',
            title: 'Pork Adobo',
            desc: 'A classic Filipino dish made with pork braised in soy sauce fawdkawdmalfmamkwdmawdmawdmamwlm frfj' ,
            time: '4H', 
            category: 'Main Dish',
            tags: ['Filipino', 'Pork', 'Savory'],
        },
        {   
            id: 3,
            src: '../assets/Adobo.jpg',
            title: 'Pork Adobo',
            desc: 'A classic Filipino dish made with pork braised in soy sauce fawdkawdmalfmamkwdmawdmawdmamwlm frfj' ,
            time: '4H', 
            category: 'Main Dish',
            tags: ['Filipino', 'Pork', 'Savory'],
        }
    ])

    const createRecipe = (e) => {
        navigate('/createrecipe');
    }

    const searchRecipe = (searchData) => {
        const search = searchData.search;
        setSearch(search);
        navigate(`/?search=${encodeURIComponent(search)}`);
    }


    return (
        <div className='overflow-auto min-h-screen bg-semiwhite'>
            <div className='flex flex-row gap-2 sm:gap-3 lg:gap-4'>
                <div className='shrink-0'>
                    <LogoTitle hideTextOnSmall backHomepage/>
                </div>
                <div className='flex-1 flex items-center justify-center shrink-1'>
                    <SearchBar onSubmit={searchRecipe}/>
                </div>
                <div className='flex items-center justify-center mr-5 sm:mr-7 lg:mr-10 shrink-0'>
                    <AddRecipeButton addRecipe={createRecipe} />
                </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full p-5 sm:p-7 lg:p-10'>
                {recipes.map((recipe, index) => (
                    <RecipeCard
                        index={index}
                        key={recipe.id}
                        src={recipe.src}
                        title={recipe.title}
                        desc={recipe.desc}
                        time={recipe.time}
                        category={recipe.category}
                        tags={recipe.tags}
                    />

                ))
            }
            </div>
        </div>

    )
}

export default HomePage;