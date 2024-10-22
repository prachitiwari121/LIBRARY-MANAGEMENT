export default ({
    data: () => ({
        requests: []
    }),
    methods: {

        revokeBook(request_id) {
            fetch('/api/revoke-request/' + request_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
            .then((res) => {
                if (res.ok) {
                    this.getBookDetails(this.bookInfo.book_id);
                }
            })
        },
        getPendingApprovals() {

            fetch('/api/book-requests', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(res => res.json())
                .then((res) => {
                    this.requests = res
                })

        },
        approveBook(book_id) {
            fetch('/api/approve-request/' + book_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        },
        rejectBook(book_id) {
            fetch('/api/reject-request/' + book_id, {
                method: "POST",
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        }
    },
    created() {
        this.getPendingApprovals();
    },
    template: `
    <div class="px-3 mt-4 pb-5">
        <h3 style="color: #4CAF50; text-align: center;">Book Requests</h3>
        <table class="table table-bordered table-striped" style="border-radius: 15px; overflow: hidden;">
            <thead style="background-color: #f5f5f5;">
            <tr>
                <th style="background-color: #FFD700; color: #fff; text-align: center;">Book Name</th>
                <th style="background-color: #FF6347; color: #fff; text-align: center;">User Name</th>
                <th style="background-color: #1E90FF; color: #fff; text-align: center;">Action</th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="request,i in requests.pending" style="text-align: center;">
                    <td style="padding: 10px;">{{request.book.title}}</td>
                    <td style="padding: 10px;">{{request.user.name}}</td>
                    <td style="padding: 10px;">
                        <button class="btn btn-sm btn-success" @click="approveBook(request.id)" style="border-radius: 20px; background-color: #28a745; border-color: #28a745;">Approve</button>
                        <button class="btn btn-sm btn-danger" @click="rejectBook(request.id)" style="border-radius: 20px; background-color: #dc3545; border-color: #dc3545;">Reject</button>
                        <button class="revoke" @click="revokeBook(request.id)" style="border-radius: 20px; background-color: #dc3545; border-color: #dc3545;">Revoke</button>
                    </td>
                </tr>
            </tbody>
        </table>    
    </div>
    `
})
