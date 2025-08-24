import LogoTitle from "@/components/LogoTitle";
import RecipeAssistantButton from "@/components/RecipeAssistantButton";
import { useState, useEffect } from "react";
import TimeIcon from "@/assets/timed_icon.svg";
import DeleteButton from '@/assets/trash_icon.svg'
import { useNavigate } from "react-router-dom";
import RecipeAssistant from "@/components/RecipeAssistant";

function InputRecipe ({ initialData = null, onSave, allowAssistant = true}) {
    // ----- States -----
    const navigate = useNavigate();
    const [showAssistant, setShowAssistant] = useState(false);
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [instructions, setInstructions] = useState('');
    const [notes, setNotes] = useState('');
    const [rows, setRows] = useState([{ name: "", quantity: "", notes: "" }]);
    const [recipeName, setRecipeName] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState('');  // ✅ added category state
    const [imagePreview, setImagePreview] = useState('');

    // ----- Prefill if editing -----
    useEffect(() => {
        if (initialData) {
        // Set preview to stored image (URL or path from backend)
            setImagePreview(initialData.image || '');
        
            // No new file chosen yet
            setImage(null);
            setImage(initialData.image ? { preview: initialData.image, file: null } : null);
            setTags(initialData.tags || []);
            setInstructions(initialData.instructions || '');
            setNotes(initialData.notes || '');
            setRows(initialData.ingredients?.length ? [...initialData.ingredients, { name: "", quantity: "", notes: "" }] : [{ name: "", quantity: "", notes: "" }]);
            setRecipeName(initialData.recipeName || '');
            setDescription(initialData.description || '');
            setTime(initialData.time || '');
            setCategory(initialData.category || '');
        }
    }, [initialData]);

    // ----- Ingredient Handlers -----
    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);

        // If editing last row and has data, add a new blank row
        if (index === rows.length - 1 && Object.values(newRows[index]).some(v => v !== "")) {
            newRows.push({ name: "", quantity: "", notes: "" });
            setRows(newRows);
        }
    };

    const handleDelete = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    // ----- Tags -----
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            setTags([...tags, inputValue.trim()]);
            setInputValue('');
        }
    };

    // ----- Image -----
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setImage(file); 
        }
    };

    // ----- Save -----
    const handleSave = () => {
        const dataToSave = {
            image,
            recipeName,
            description,
            time,
            tags,
            category,
            instructions,
            notes,
            ingredients: rows.filter(row => Object.values(row).some(v => v !== "")) // remove last empty row
        };

        if (onSave) onSave(dataToSave);
        console.log("Recipe Saved:", dataToSave); // debug
    };

    const onCancel = () => {
        navigate('/home');
    }

    return (
        <div className='w-full h-fit overflow-auto bg-semiwhite'>
            {/* Header */}
            {/* Header */}
            <div className="w-full flex flex-row items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                <div className="shrink-0">
                <LogoTitle hideTextOnSmall backHomepage />
                </div>
                {allowAssistant && (
                    <div className="h-full flex items-center mr-5 sm:mr-7 lg:mr-10">
                        <RecipeAssistantButton onOpen={() => setShowAssistant(true)} />
                    </div>
                )}
            </div>

            {/* Show modal when button clicked */}
            {showAssistant && (
            <RecipeAssistant 
                onClose={() => setShowAssistant(false)}
                onSubmit={(generatedData) => {
                // Fill InputRecipe fields with AI-generated data
                setRecipeName(generatedData.recipeName);
                setDescription(generatedData.description);
                setTime(generatedData.time);
                setCategory(generatedData.category);
                setTags(generatedData.tags || []);
                setInstructions(generatedData.instructions);
                setNotes(generatedData.notes);
                setRows(generatedData.ingredients?.length ? [...generatedData.ingredients, { name: "", quantity: "", notes: "" }] : [{ name: "", quantity: "", notes: "" }]);
                }}
            />
            )}

            {/* Image + Info */}
            <div className='w-full h-120 px-12 py-3 box-border flex flex-row'>
                <div className="w-1/2 h-full flex items-center justify-center rounded-l-lg overflow-hidden">
                    {!image ? (
                        <label htmlFor="file-upload" className="border-2 border-green cursor-pointer rounded-l-lg flex items-center justify-center w-full h-full bg-white text-green font-semibold">
                            Upload Image
                            <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
                        </label>
                    ) : (
                        <div className="relative w-full h-full">
                            <img src={imagePreview} alt="Preview" className=" border-y-2 border-l-2 border-green rounded-l-lg w-full h-full object-cover"/>
                            <button onClick={() => setImage(null)} className="absolute top-2 left-2 bg-green bg-opacity-60 text-white px-2 py-1 text-xs rounded">
                                Change
                            </button>
                        </div>
                    )}
                </div>
                <div className="w-1/2 h-full border-y-2 border-r-2 bg-white border-green rounded-r-lg overflow-hidden">
                    <div className="px-10 pt-10 pb-6">
                        <input
                            type='text'
                            placeholder='Recipe Name'
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            className="w-full h-15 text-green text-5xl font-bold focus:outline-none focus:ring-0 focus:border-transparent scrollbar-hide"
                        />
                        <textarea
                            placeholder='Enter description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='w-full h-50 text-black text-lg mt-5 p-2 resize-none focus:outline-none focus:ring-0 focus:border-transparent scrollbar-hide'
                        />
                    </div>
                    <div className='flex items-center gap-1 justify-end pb-4'>
                        <img src={TimeIcon} alt='Search Icon' className='h-6 w-6 rounded-full'/>
                        <input
                            placeholder='Time'
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className='w-20 text-black text-sm focus:outline-none focus:ring-0 focus:border-transparent scrollbar-hide'
                        />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-row px-3 pt-3 overflow-x-auto gap-2 scrollbar-hide">
                        <div className="flex items-center rounded-sm bg-green-900 h-8 px-3">
                            <input type="text" placeholder="Category" onChange={(e) => setCategory(e.target.value)} className="text-sm text-white bg-transparent font-bold min-w-16 field-sizing-content focus:outline-none focus:ring-0 focus:border-transparent"/>
                        </div>
                        <div className='flex items-center rounded-sm bg-green h-8 px-3'>
                            <input
                                type="text"
                                placeholder="Add tag"
                                className="text-sm text-white bg-transparent min-w-14 field-sizing-content focus:outline-none focus:ring-0 focus:border-transparent"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        {tags.map((tag, index) => (
                            <div key={index} className="relative flex items-center rounded-sm bg-green h-8 px-3">
                                <p className="text-sm text-white truncate">{tag}</p>
                                <button
                                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600"
                                    onClick={() => {
                                        const newTags = [...tags];
                                        newTags.splice(index, 1);
                                        setTags(newTags);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ingredients + Instructions */}
            <div className="w-full h-120 px-12 py-3 box-border flex flex-row">
                <div className="h-full w-1/2 border-2 rounded-l-lg border-green bg-white flex flex-col">
                    <div className="flex-1 overflow-auto scrollbar-hide">
                        <table className="w-full border-collapse overflow-auto">
                            <thead className="sticky top-0">
                                <tr className="bg-green">
                                    <th className="px-2 py-1 text-white">Name</th>
                                    <th className="px-2 py-1 text-white">Quantity</th>
                                    <th className="px-2 py-1 text-white">Notes</th>
                                    <th className="px-2 py-1 text-white">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={index} className="hover:bg-green-50">
                                        <td className="w-1/3 border-b border-green px-2 py-1">
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={(e) => handleChange(index, "name", e.target.value)}
                                                className="w-full focus:outline-none"
                                            />
                                        </td>
                                        <td className="w-1/5 border-b border-green px-2 py-1">
                                            <input
                                                type="text"
                                                value={row.quantity}
                                                onChange={(e) => handleChange(index, "quantity", e.target.value)}
                                                className="w-full focus:outline-none"
                                            />
                                        </td>
                                        <td className="w-1/4 border-b border-r border-green px-2 py-1">
                                            <input
                                                type="text"
                                                value={row.notes}
                                                onChange={(e) => handleChange(index, "notes", e.target.value)}
                                                className="w-full focus:outline-none"
                                            />
                                        </td>
                                        <td className="w-1/5 border-b border-green px-2 py-1 text-center">
                                            {Object.values(row).some((v) => v !== "") && (
                                                <button onClick={() => handleDelete(index)}>
                                                    <img className="w-5 h-4" src={DeleteButton} alt="delete ingredients"/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="h-full w-1/2 border-y-2 border-r-2 rounded-r-lg border-green bg-white flex flex-col scrollbar-hide overflow-hidden">
                    <h2 className="text-green text-lg font-bold px-3 py-1 shrink-0">Instructions</h2>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Enter cooking steps here..."
                        className="w-full h-110 resize-none overflow-auto focus:outline-none focus:ring-0 focus:border-transparent p-2 rounded-lg scrollbar-hide"
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="w-full h-80 px-12 py-3 box-border">
                <div className="h-full w-full flex flex-col rounded-lg overflow-hidden bg-white border-2 border-green">
                    <h2 className="text-green text-lg font-bold px-3 py-1 shrink-0">Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter cooking notes here..."
                        className="w-full h-full resize-none overflow-auto focus:outline-none focus:ring-0 focus:border-transparent px-5 rounded-lg scrollbar-hide"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="h-15 p-20 pb-30 w-full flex items-center justify-center gap-40">
                <button
                    className="h-15 w-50 text-green border-green border-2 bg-white rounded-md
                    hover:bg-neutral-200 hover:scale-105 
                    active:bg-neutral-100 active:scale-95 
                    focus:outline-none focus:outline-0
                    shadow-none transition-all duration-200"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    className="h-15 w-50 text-white border-green border-2 bg-green rounded-md
                    hover:bg-green-800 hover:scale-105 
                    active:bg-green-900 active:scale-95 
                    focus:outline-none focus:outline-0
                    shadow-none transition-all duration-200"
                    onClick={handleSave}
                >
                    Save
                </button>
            </div>
        </div>
    )
}

export default InputRecipe;