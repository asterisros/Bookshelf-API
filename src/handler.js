const { nanoid } = require('nanoid');
const books = require('./books');

// menambahkan data buku
const addBookHandler = (request, h) => {
  // client mengirimkan request dengan data buku yang diperlukan
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

  // bila read page melebih pageCount maka invalid.
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // data buku yang disimpan di server
  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

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
  books.push(newBook);

  // mengetahui buku telah diinputkan
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // set status code: created
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

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
  let book = books;
  const { name, reading, finished } = request.query;

  if (name !== undefined) {
    book = book.filter((b) => b
      .name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading !== undefined) {
    book = book.filter((b) => b.reading === !!Number(reading));
  }

  if (finished !== undefined) {
    book = book.filter((b) => b.finished === !!Number(finished));
  }

  const response = h.response({
    status: 'success',
    data: {
      // buat object buku dgn value elemen id, nama, dan publisher
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

// menampilkan detail buku
const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
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

const updateBookByIdHandler = (request, h) => {
  // kita ambil id nya
  const { bookId } = request.params;

  // ambil data-data buku dari request an
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

  // kan index ini array. Nah elemen arraynya adalah seluruh buku (books)
  // kita ambil 1 buku aja, karena mau diupdate kan.
  const index = books.findIndex((book) => book.id === bookId);

  // kalau misalnya ada index buku di array, yuk kita ambil data buku itu.
  if (index !== -1) {
    // kalo client nya nggak menyertakan nama buku, nggak boleh tampilin datanya.
    if (name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      });
      response.code(400);
      return response;
    }

    // nah trus kalo nilai property readPage > pageCount kan aneh,
    // jadi ya jangan tampilin datanya.
    if (readPage > pageCount) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      });
      response.code(400);
      return response;
    }

    // kita bikin property finished dari buku.
    const finished = pageCount === readPage;

    // trus kita ambil deh semua data detail dari bukunya.
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

    // nah kalau sudah, kita tampilkan responsenya
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  // kalau gagal, kita kasih response juga ya.
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  // dapatkan index dari objek buku sesuai dengan id yang didapat
  const index = books.findIndex((item) => item.id === bookId);

  // kalau ada elemen objek buku di array index, yuk kita ambil untuk dihapus.
  if (index !== -1) {
    books.splice(index, 1);
    // kita kasih response berhasil dihapus
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // kalau gagal dihapus, kita berikan response juga.
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// kita export fungsi-fungsi nya untuk digunakan di routes.js
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
