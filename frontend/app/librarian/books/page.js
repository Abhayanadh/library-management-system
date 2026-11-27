"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Eye, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableContainer, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { booksApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function LibrarianBooksContent() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ isbn: "", title: "", author: "", category: "Computer Science", publisher: "", publication_year: "", description: "", num_copies: 1 });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await booksApi.list(search ? { q: search } : {});
      setBooks(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 400);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await booksApi.create({ ...form, num_copies: Number(form.num_copies), publication_year: form.publication_year ? Number(form.publication_year) : null });
      setOpenAdd(false);
      notify("Book added successfully!");
      fetchBooks();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await booksApi.update(editBook.id, { title: form.title, author: form.author, category: form.category, publisher: form.publisher, publication_year: form.publication_year ? Number(form.publication_year) : null, description: form.description });
      setEditBook(null);
      notify("Book updated successfully!");
      fetchBooks();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await booksApi.delete(deleteBook.id);
      setDeleteBook(null);
      notify("Book deleted.");
      fetchBooks();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const openEdit = (book) => {
    setForm({ isbn: book.isbn, title: book.title, author: book.author, category: book.category, publisher: book.publisher || "", publication_year: book.publication_year || "", description: book.description || "", num_copies: 1 });
    setEditBook(book);
  };

  return (
    <DashboardShell role="librarian" title="Manage Books & Copies" subtitle="Add, update, delete, and search VVITU library books">
      {toast && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{toast}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error} <button className="ml-2 underline" onClick={() => setError("")}>Dismiss</button></div>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by title, author, ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="gold" onClick={() => { setForm({ isbn: "", title: "", author: "", category: "Computer Science", publisher: "", publication_year: "", description: "", num_copies: 1 }); setOpenAdd(true); }}>
          <Plus className="h-4 w-4" />Add New Book
        </Button>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>ISBN</TableHeaderCell>
            <TableHeaderCell>Title & Author</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Copies (Avail/Total)</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></TableCell>)}</TableRow>
            ))
          ) : books.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="py-10 text-center text-xs text-slate-500">No books found. Click &ldquo;Add New Book&rdquo; to get started.</TableCell></TableRow>
          ) : books.map((book) => (
            <TableRow key={book.id}>
              <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
              <TableCell><p className="font-semibold text-vvitu-navy">{book.title}</p><p className="text-xs text-slate-500">{book.author}</p></TableCell>
              <TableCell><Badge variant="navy">{book.category}</Badge></TableCell>
              <TableCell><span className={book.available_copies > 0 ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>{book.available_copies}</span><span className="text-slate-400"> / {book.total_copies}</span></TableCell>
              <TableCell>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => openEdit(book)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteBook(book)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </TableContainer>

      {/* Add Book Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} title="Add New Book" description="Register a book title and initial physical copies">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><Label htmlFor="bIsbn">ISBN</Label><Input id="bIsbn" required placeholder="978-0132350884" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
          <div><Label htmlFor="bTitle">Book Title</Label><Input id="bTitle" required placeholder="e.g. Clean Code" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="bAuthor">Author</Label><Input id="bAuthor" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div><Label htmlFor="bCat">Category</Label>
              <Select id="bCat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Computer Science</option><option>Electronics &amp; Communication</option><option>Mathematics</option><option>Mechanical Engineering</option><option>Reference &amp; Journals</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="bPub">Publisher</Label><Input id="bPub" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} /></div>
            <div><Label htmlFor="bYear">Publication Year</Label><Input id="bYear" type="number" value={form.publication_year} onChange={(e) => setForm({ ...form, publication_year: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="bCopies">Number of Physical Copies</Label><Input id="bCopies" type="number" min={1} value={form.num_copies} onChange={(e) => setForm({ ...form, num_copies: e.target.value })} /></div>
          <div><Label htmlFor="bDesc">Description</Label><Textarea id="bDesc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Saving..." : "Save Book"}</Button></div>
        </form>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={Boolean(editBook)} onClose={() => setEditBook(null)} title="Edit Book" description={editBook?.isbn}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Author</Label><Input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
          <div><Label>Category</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Computer Science</option><option>Electronics &amp; Communication</option><option>Mathematics</option><option>Mechanical Engineering</option>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Publisher</Label><Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} /></div>
            <div><Label>Year</Label><Input type="number" value={form.publication_year} onChange={(e) => setForm({ ...form, publication_year: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditBook(null)}>Cancel</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Saving..." : "Update Book"}</Button></div>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteBook)} onClose={() => setDeleteBook(null)} title="Delete Book?" description="This cannot be undone">
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Deleting <strong>{deleteBook?.title}</strong> will also remove all its physical copies. Books with active issues cannot be deleted.</span>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleteBook(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete} disabled={submitting}>{submitting ? "Deleting..." : "Delete Book"}</Button></div>
        </div>
      </Dialog>
    </DashboardShell>
  );
}

export default function LibrarianBooksPage() {
  return <ProtectedRoute allowedRoles={["librarian", "admin"]}><LibrarianBooksContent /></ProtectedRoute>;
}
