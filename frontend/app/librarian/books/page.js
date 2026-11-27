"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  IndianRupee,
  ShieldAlert,
  BookOpen,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Input, Label, Select, Textarea } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import {
  TableContainer,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/ui/Table";
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
  const [form, setForm] = useState({
    isbn: "",
    title: "",
    author: "",
    category: "Computer Science",
    publisher: "",
    publication_year: "",
    description: "",
    price: 450.0,
    replacement_cost: 600.0,
    num_copies: 2,
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await booksApi.list(search ? { q: search } : {});
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 350);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await booksApi.create({
        ...form,
        price: Number(form.price),
        replacement_cost: Number(form.replacement_cost),
        num_copies: Number(form.num_copies),
        publication_year: form.publication_year
          ? Number(form.publication_year)
          : null,
      });
      setOpenAdd(false);
      notify("Book added to catalog with pricing and physical copies!");
      fetchBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await booksApi.update(editBook.id, {
        title: form.title,
        author: form.author,
        category: form.category,
        publisher: form.publisher,
        publication_year: form.publication_year
          ? Number(form.publication_year)
          : null,
        description: form.description,
        price: Number(form.price),
        replacement_cost: Number(form.replacement_cost),
      });
      setEditBook(null);
      notify("Book metadata & price updated successfully!");
      fetchBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setError("");
    try {
      await booksApi.delete(deleteBook.id);
      setDeleteBook(null);
      notify("Book title and inventory removed.");
      fetchBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (book) => {
    setForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher || "",
      publication_year: book.publication_year || "",
      description: book.description || "",
      price: book.price || 450.0,
      replacement_cost: book.replacement_cost || 600.0,
      num_copies: 1,
    });
    setEditBook(book);
  };

  return (
    <DashboardShell
      role="librarian"
      title="Book Inventory & Price Management"
      subtitle="Authorized Admin/Staff: Add books, modify pricing, and track physical copies"
    >
      {toast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          ✅ {toast}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}{" "}
          <button className="ml-2 underline font-bold" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="gold"
          onClick={() => {
            setForm({
              isbn: "",
              title: "",
              author: "",
              category: "Computer Science",
              publisher: "",
              publication_year: "",
              description: "",
              price: 450.0,
              replacement_cost: 600.0,
              num_copies: 2,
            });
            setOpenAdd(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add New Book &amp; Price
        </Button>
      </div>

      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>ISBN</TableHeaderCell>
            <TableHeaderCell>Title &amp; Author</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Book Price / Lost Cost</TableHeaderCell>
            <TableHeaderCell>Available / Total</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 animate-pulse rounded bg-slate-100" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : books.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-12 text-center text-xs text-slate-500"
              >
                <BookOpen className="mx-auto mb-2 h-7 w-7 text-vvitu-gold-dark" />
                No books found. Click &ldquo;Add New Book &amp; Price&rdquo; to add your first title!
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book.id}>
                <TableCell className="font-mono text-xs">{book.isbn}</TableCell>
                <TableCell>
                  <p className="font-semibold text-vvitu-navy">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.author}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="navy">{book.category}</Badge>
                </TableCell>
                <TableCell>
                  <p className="font-bold text-slate-900">
                    ₹{book.price || 450.0}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Lost: ₹{book.replacement_cost || 600.0}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      book.available_copies > 0
                        ? "font-semibold text-emerald-700"
                        : "font-semibold text-red-600"
                    }
                  >
                    {book.available_copies}
                  </span>
                  <span className="text-slate-400"> / {book.total_copies}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Edit book & price"
                      onClick={() => openEdit(book)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      title="Delete book"
                      onClick={() => setDeleteBook(book)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </tbody>
      </TableContainer>

      {/* Add Book Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Add Book to University Catalog"
        description="Specify ISBN, metadata, acquisition price, and physical barcode count"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <Label htmlFor="bIsbn">ISBN / Barcode</Label>
            <Input
              id="bIsbn"
              required
              placeholder="978-0132350884"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bTitle">Book Title</Label>
            <Input
              id="bTitle"
              required
              placeholder="e.g. Artificial Intelligence: A Modern Approach"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bAuthor">Author(s)</Label>
              <Input
                id="bAuthor"
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bCat">Category</Label>
              <Select
                id="bCat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Computer Science</option>
                <option>Electronics &amp; Communication</option>
                <option>Mathematics</option>
                <option>Mechanical Engineering</option>
                <option>Reference &amp; Journals</option>
              </Select>
            </div>
          </div>

          {/* Pricing Controls */}
          <div className="grid gap-4 rounded-xl border border-vvitu-gold/40 bg-vvitu-gold/10 p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bPrice">Catalog Price (₹)</Label>
              <Input
                id="bPrice"
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bLostCost">Lost Replacement Fee (₹)</Label>
              <Input
                id="bLostCost"
                type="number"
                step="0.01"
                required
                value={form.replacement_cost}
                onChange={(e) =>
                  setForm({ ...form, replacement_cost: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bPub">Publisher</Label>
              <Input
                id="bPub"
                value={form.publisher}
                onChange={(e) =>
                  setForm({ ...form, publisher: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="bCopies">Initial Physical Copies</Label>
              <Input
                id="bCopies"
                type="number"
                min={1}
                value={form.num_copies}
                onChange={(e) =>
                  setForm({ ...form, num_copies: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bDesc">Book Overview</Label>
            <Textarea
              id="bDesc"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenAdd(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving Book..." : "Save Book & Price"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Book & Price Dialog */}
      <Dialog
        open={Boolean(editBook)}
        onClose={() => setEditBook(null)}
        title="Modify Book Metadata &amp; Pricing"
        description={`Editing ISBN: ${editBook?.isbn}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <Label>Book Title</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Author</Label>
            <Input
              required
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>

          <div className="grid gap-4 rounded-xl border border-vvitu-gold/40 bg-vvitu-gold/10 p-4 sm:grid-cols-2">
            <div>
              <Label>Catalog Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Lost Replacement Cost (₹)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={form.replacement_cost}
                onChange={(e) =>
                  setForm({ ...form, replacement_cost: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditBook(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Updating..." : "Update Book & Price"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={Boolean(deleteBook)}
        onClose={() => setDeleteBook(null)}
        title="Delete Book from Catalog?"
        description="Permanently remove title and all copy records"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <span>
              Deleting <strong>{deleteBook?.title}</strong> will purge all
              physical inventory. Books with active student loans cannot be
              deleted.
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteBook(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete Book"}
            </Button>
          </div>
        </div>
      </Dialog>
    </DashboardShell>
  );
}

export default function LibrarianBooksPage() {
  return (
    <ProtectedRoute allowedRoles={["librarian", "admin"]}>
      <LibrarianBooksContent />
    </ProtectedRoute>
  );
}
