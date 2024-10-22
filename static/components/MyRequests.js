export default ({
    data: () => ({
        myRequests: []
    }),
    methods: {
        async getRequests() {
            const res = await fetch('/api/my-requests', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            });
            if (res.ok) {
                this.myRequests = await res.json();
            }
        },

        async returnBook(request) {
            // Immediately update the UI
            request.is_returned = true;
            request.return_date = new Date().toISOString().slice(0, 10); // Set return date to today's date

            // Make the API call to return the book
            const res = await fetch(`/api/return-request/${request.id}`, {
                method: 'POST',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requestId: request.id })
            });

            if (!res.ok) {
                console.error('Failed to return the book');
                // Revert the UI change if the request failed
                request.is_returned = false;
                request.return_date = null;
            }
        }
    },
    computed: {
        pdfFilePath(book) {
            if (book && book.pdf) {
                return "static/uploaded/" + book.pdf; // Adjust this path as needed
            } else {
                return '';
            }
        }
    },
    created() {
        this.getRequests();
    },
    template: `
        <div class="dashboard-container">
            <div class="dashboard-content">
                <table class="dashboard-table">
                    <thead>
                        <tr>
                            <th>Book Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request, i in myRequests" :key="i">
                            <td>{{ request.book.title }}</td>
                            <td>
                                <template v-if="request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">
                                    <span class="badge issued">Issued on {{ request.issue_date }}</span>
                                    <a v-if="request.book.pdf && !request.is_returned"
                                        :href="'static/uploaded/' + request.book.pdf"
                                        target="_blank"
                                        style="text-decoration: none; color: inherit;">
                                        📖 Read
                                    </a>
                                </template>
                                <template v-if="request.is_returned">
                                    <span class="badge returned">Returned on {{ request.return_date }}</span>
                                </template>
                                <template v-if="!request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected">
                                    <span class="badge pending">Pending</span>
                                </template>
                                <template v-if="!request.is_approved && request.is_rejected">
                                    <span class="badge rejected">Rejected</span>
                                </template>
                                <template v-if="request.is_approved && request.is_revoked">
                                    <span class="badge revoked">Revoked Access</span>
                                </template>
                            </td>
                            <td>
                                <button v-if="request.is_approved && !request.is_returned && !request.is_revoked && !request.is_rejected"
                                        @click="returnBook(request)">
                                    Return Book
                                </button>
                                <span v-if="request.is_returned" class="badge returned">Book Returned</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
});
