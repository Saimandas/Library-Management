import axios from 'axios';
import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable';

const AddBook = () => {

    const [category, setcategory] = useState([])
    const categoryOptions = category.map((item) => ({
        label: item,
        value: item,
    }));

    const [currentCateogry, setcurrentCateogry] = useState(null);
    const [BookName, setBookName] = useState("");
    const [author, setauthor] = useState("");
    const [totalCopies, settotalCopies] = useState(0);

    const [edition, setedition] = useState("");
    const [isbn, setisbn] = useState("");
    const [publishedYear, setpublishedYear] = useState("");
    const [publisher, setpublisher] = useState("");

    const handleInput=(type,value)=>{
        if (type==="name") {
            setBookName(value)
        }
        if (type==="author") {
            setauthor(value)
        }
        if (type==="copies") {
            settotalCopies(value)
        }
        if (type==="edition") {
            setedition(value)
        }
        if (type==="isbn") {
            setisbn(value)
        }
        if (type==="year") {
            setpublishedYear(value)
        }
        if (type==="publisher") {
            setpublisher(value)
        }
    }

    useEffect( ()=>{
        async function fetchData(){
           const res=await axios.get("/api/admin/categories");
            if (!res.data) {
            }else{
            const data=res.data.data;
            const formatedData=data.map((e)=>{
              return e.name;
            })
            console.log(formatedData);
            setcategory(formatedData)
        }}
        fetchData();
    },[])

    const onCateChange=(selectedOption)=>{      
        setcurrentCateogry(selectedOption)
    }

    const addBook=async(e)=>{
      console.log("value",currentCateogry);
      e.preventDefault();
        try {
            const res=await axios.post("/api/admin/add-book",{
              title:BookName,
              author:author,
              category:currentCateogry?.value,
              totalCopies:totalCopies,
              edition: edition,
              isbn: isbn,
              publishedYear: publishedYear,
              publisher: publisher
            })
            if (res.data.data.statusCode===201) {
              alert("Book added successfully");
              setBookName("");
              setauthor("");
              settotalCopies(0);
              setcurrentCateogry(null);
              setedition("");
              setisbn("");
              setpublishedYear("");
              setpublisher("");
            }
        } catch (error) {
            console.log(error)
        }finally{
          setBookName("");
          setauthor("");
          settotalCopies(0);
          setcurrentCateogry(null);
          setedition("");
          setisbn("");
          setpublishedYear("");
          setpublisher("");
          alert("Book added successfully");
        }
    }

    const handleCancel = () => {
      setBookName("");
      setauthor("");
      settotalCopies(0);
      setcurrentCateogry(null);
      setedition("");
      setisbn("");
      setpublishedYear("");
      setpublisher("");
    }

    const isDisabled = 
      !BookName || 
      !author || 
      !currentCateogry || 
      !totalCopies || 
      !edition || 
      !isbn || 
      !publishedYear || 
      !publisher;

  return (
    <div className='min-h-screen bg-gray-100 p-6 md:p-10'>

      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
          Add New Book
        </h1>
        <p className='text-gray-500 mt-1'>
          Fill the details to add a book to the library
        </p>
      </div>

      <div className='bg-white rounded-2xl shadow-sm p-6 md:p-8 max-w-3xl'>

        <form className='space-y-6'>

          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Book Title
            </label>
            <input
              type='text'
              value={BookName}
              onChange={(e)=>{handleInput("name",e.target.value)}}
              placeholder='Enter book title'
              className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-600 mb-1'>
              Author
            </label>
            <input
              type='text'
              value={author}
              onChange={(e)=>{handleInput("author",e.target.value)}}
              placeholder='Enter author name'
              className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Edition
              </label>
              <input
                type='text'
                value={edition}
                onChange={(e)=>{handleInput("edition",e.target.value)}}
                placeholder='e.g. 1st'
                className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                ISBN
              </label>
              <input
                type='text'
                value={isbn}
                onChange={(e)=>{handleInput("isbn",e.target.value)}}
                placeholder='Enter ISBN'
                className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Category
              </label>
              <CreatableSelect value={currentCateogry} options={categoryOptions} onChange={(e) => onCateChange(e)}/>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Total Copies
              </label>
              <input
                type='number'
                value={totalCopies}
                onChange={(e)=>{handleInput("copies",e.target.value)}}
                placeholder='0'
                className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Published Year
              </label>
              <input
                type='number'
                value={publishedYear}
                onChange={(e)=>{handleInput("year",e.target.value)}}
                placeholder='e.g. 2020'
                className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Publisher
              </label>
              <input
                type='text'
                value={publisher}
                onChange={(e)=>{handleInput("publisher",e.target.value)}}
                placeholder='Enter publisher'
                className='w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-amber-400'
              />
            </div>
          </div>

          <div className='flex gap-4 pt-4'>
            <button
              type='submit' 
              onClick={addBook}
              disabled={isDisabled}
              className={`px-6 py-3 rounded-xl transition 
                ${isDisabled 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-amber-500 text-white hover:bg-amber-600"}`}
            >
              Add Book
            </button>

            <button
              type='button'
              onClick={handleCancel}
              className='px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition'
            >
              Cancel
            </button>
          </div>

        </form>

      </div>

    </div>
  )
}

export default AddBook