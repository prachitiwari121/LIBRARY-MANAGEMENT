

import Book from './Book.js';
import BookDetailsModal from "./BookDetailsModal.js";

export default {
    data() {
        return {
            loading: false,
            newBook: {
                title: '',
                content: '',
                author: '',
                image: '',
                pdf: '',  // New field for PDF
                section: '',
            },
            bookList: [],
            sections: [],
            bootstrapModal: {}
        };
    },
    methods: {
        async getAllSections() {
            try {
                const res = await fetch('/api/section', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                this.sections = await res.json();
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        },
        async addBook() {
            this.loading = true;

            const formData = new FormData();
            const fileInput = this.$refs.bookImage[0];
            const pdfInput = this.$refs.bookPdf[0]; // Reference to PDF input

            if (fileInput.files.length > 0) {
                formData.append("image", fileInput.files[0]);
            }

            if (pdfInput.files.length > 0) {
                formData.append("pdf", pdfInput.files[0]); // Append PDF file to formData
            }

            Object.keys(this.newBook).forEach(key => {
                if (key !== 'image' && key !== 'pdf') formData.append(key, this.newBook[key]);
            });

            try {
                const res = await fetch('/api/book', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    await this.getAllBooks();
                    this.bootstrapModal.hide();
                    this.resetNewBook();
                } else {
                    const data = await res.json();
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error adding book:', error);
            } finally {
                this.loading = false;
                this.resetNewBook();
            }
        },
        async getAllBooks() {
            try {
                const res = await fetch('/api/book', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                this.bookList = await res.json();
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        },
        showBookDetail(book) {
            this.$refs.bookModal.viewModal(book);
        },
        resetNewBook() {
            this.newBook = {
                title: '',
                content: '',
                author: '',
                image: '',
                pdf: '',  // Reset PDF field
                section: '',
            };
        },
        async deleteBook(book_id) {
            const confirmation = confirm("Are you sure you want to delete this book?");
            if (!confirmation) {
                return;
            }
            try {
                const res = await fetch(`/api/book/${book_id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                if (res.ok) {
                    await this.getAllBooks();
                } else {
                    const data = await res.json();
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }

    },
    async mounted() {
        this.bootstrapModal = new bootstrap.Modal(document.getElementById('addNewBookModal'));
        await this.getAllBooks();
        await this.getAllSections();
    },
    computed: {
        role() {
            return localStorage.getItem('role');
        },
        newBookInputs() {
            return [
                { label: 'Book Title', model: 'title', type: 'input', inputType: 'text', rows: null, maxlength: null },
                { label: 'Book Author', model: 'author', type: 'input', inputType: 'text', rows: null, maxlength: null },
                { label: 'Book Cover', model: 'image', type: 'input', inputType: 'file', rows: null, maxlength: null, ref: 'bookImage' },
                { label: 'Section', model: 'section', type: 'select', inputType: null, rows: null, maxlength: null, options: this.sections.map(section => ({ value: section.section_id, text: section.section_name })) },
                { label: 'Book Description', model: 'content', type: 'textarea', inputType: null, rows: 10, maxlength: 7000 },
                { label: 'Book PDF', model: 'pdf', type: 'input', inputType: 'file', rows: null, maxlength: null, ref: 'bookPdf' } // New PDF input
            ];
        }
    },
    components: { Book, BookDetailsModal },
    template: `
        <div class="pb-5 mt-3">
            <div class="px-3 mt-3">
                <div class="clearfix">
                    <div class="float-start">
                        <h2 class="mb-0 text-primary">Books Available</h2>
                    </div>
                    <div class="float-end">
                        <button v-if="role === 'libr'" type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addNewBookModal">
                            Add New Book
                        </button>
                    </div>
                </div>
                <div class="row justify-content-left">
                    <div class="col-lg-4 col-md-6 col-sm-12 mt-3" v-for="(book, i) in bookList" :key="i">
                        <div class="card book-card shadow-sm" style="background-color: #f8f9fa; border-left: 5px solid #007bff;">
                            <div class="card-body">
                                <h5 class="card-title text-dark">{{ book.title }}</h5>
                                <button class="btn btn-danger btn-sm me-1" v-if="role=='libr'" @click="deleteBook(book.book_id)">Delete Book</button>
                                <button @click="showBookDetail(book)" class="btn btn-outline-primary">View Details</button>
                                
                                <router-link :to="{ name: 'EditBook', params: { id: book.book_id } }" class="btn btn-warning btn-sm" v-if="role === 'libr'">Edit Book</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal fade" id="addNewBookModal" tabindex="-1" aria-labelledby="addNewBookModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header" style="background-color: #007bff; color: white;">
                            <h1 class="modal-title fs-5" id="addNewBookModalLabel">Add New Book</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <div v-for="(input, index) in newBookInputs" :key="index" class="mb-3">
                                    <label :for="input.model" class="form-label">{{ input.label }}</label>

                                    <!-- Binding based on input type -->
                                    <input 
                                        v-if="input.type === 'input'" 
                                        :type="input.inputType" 
                                        v-model="newBook[input.model]" 
                                        :class="['form-control', input.inputType === 'file' ? 'form-control-file' : '']" 
                                        :id="input.model"
                                        :ref="input.ref"
                                    />

                                    <textarea 
                                        v-if="input.type === 'textarea'" 
                                        v-model="newBook[input.model]" 
                                        :rows="input.rows" 
                                        :maxlength="input.maxlength" 
                                        class="form-control"
                                        :id="input.model"
                                    ></textarea>

                                    <select 
                                        v-if="input.type === 'select'" 
                                        v-model="newBook[input.model]" 
                                        class="form-control" 
                                        :id="input.model"
                                    >
                                        <option v-for="option in input.options" :value="option.value">{{ option.text }}</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer" style="background-color: #f1f1f1;">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" @click="addBook" :disabled="loading">
                                <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                                ADD BOOK
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <BookDetailsModal ref="bookModal"/>
        </div>
    `,
};
