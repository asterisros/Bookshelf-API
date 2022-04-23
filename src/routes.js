const {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
} = require('./handler');

const routes = [
  {
    // menyimpan buku
    method: 'POST',
    path: '/books',
    handler: addBookHandler,
  },
  {
    // menampilkan seluruh buku
    method: 'GET',
    path: '/books',
    handler: getAllBooksHandler,
  },
  {
    // menampilkan detail buku
    method: 'GET',
    path: '/books/{bookId}',
    handler: getBookByIdHandler,
  },
  {
    // mengupdate detail buku
    method: 'PUT',
    path: '/books/{bookId}',
    handler: updateBookByIdHandler,
  },
  {
    // menghapus buku
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: deleteBookByIdHandler,
  },
];

module.exports = routes;
