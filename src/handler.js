const { nanoid } = require('nanoid');
const books = require('./books');

// handler tambah data buku
const addBookHandler = (request, h) => {
  // client mengirimkan request tambah buku dengan melampirkan data-data
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // bila Client tidak melampirkan data nama, maka akan error
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // bila read page melebih pageCount maka invalid
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // data buku yang disimpan oleh server
  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // tampung seluruh data buku dalam kotak variabel bernama newBook
  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    finished,
    insertedAt,
    updatedAt,
  };
  // masukkan kotak variabel ke lemari bernama books
  books.push(newBook);

  // mengetahui apakah buku telah diinputkan
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // jika isSuccess true, maka set status code menjadi created
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // jika isSuccess gagal, maka set status code menjadi error
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// ==/==/==/==/== Menampilkan seluruh buku dengan menerapkan saran pada submission

const getAllBooksHandler = (request, h) => {
  let book = books;
  
  const { name, reading, finished } = request.query;

  // Tampilkan seluruh buku yang mengandung nama berdasarkan nilai yang diberikan pada query ini secara non-case sensitive
  if (name !== undefined) {
    book = book.filter((b) => b
      .name.toLowerCase().includes(name.toLowerCase()));
  }

  // Bernilai 0 atau 1
  if (reading !== undefined) {
    book = book.filter((b) => b.reading === !!Number(reading));
  }

  // Bernilai 0 atau 1
  if (finished !== undefined) {
    book = book.filter((b) => b.finished === !!Number(finished));
  }

  const response = h.response({
    status: 'success',
    data: {
      // buat object buku yang hanya menampilkan id, nama, dan publisher
      // gunakan map untuk mengambil id, nama, dan publisher dari keseluruhan data detail buku
      books: book.map((item) => ({
        id: item.id,
        name: item.name,
        publisher: item.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

// ==/==/==/==/== Menampilkan detail buku

const getBookByIdHandler = (request, h) => {
  // dapatkan id buku 
  const { bookId } = request.params;
  
  // filter buku berdasarkan idnya saja pada array books 
  const book = books.filter((item) => item.id === bookId)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// ==/==/==/==/== Update Buku berdasarkan ID Buku

const updateBookByIdHandler = (request, h) => {
  // ambil id buku
  const { bookId } = request.params;

  // ambil data detail buku dari request Client
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // ambil juga variabel updatedAt untuk diperbarui
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);
  if (index !== -1) {
    // kalo client tidak menyertakan nama buku, tidak boleh tampilkan datanya.
    if (name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      });
      response.code(400);
      return response;
    }

    // jangan tampilkan data ketika nilai property readPage > pageCount karena ya aneh
    if (readPage > pageCount) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      });
      response.code(400);
      return response;
    }

    // tulis property finished dari buku
    const finished = pageCount === readPage;

    // ambil semua data detail dari bukunya
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// ==/==/==/==/== Menghapus Buku

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  // dapatkan index dari objek buku sesuai dengan id yang didapat
  const index = books.findIndex((item) => item.id === bookId);

  if (index !== -1) {
  // hapus data bukunya
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// export fungsi-fungsi nya untuk digunakan di routes.js
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
