"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, BookOpen, Eye } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { TableContainer, TableHead, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { booksApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const categories = ["All Categories", "Computer Science", "Electronics & Communication", "Mathematics", "Mechanical Engineering", "Reference & Journals"];

function CatalogContent() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [availability, setAvailability] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetail, setBookDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (query) params.q = query;
      if (category !== "All Categories") params.category = category;
      if (availability !== "all") params.availability = availability;
      const data = await booksApi.list(params);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, category, availability]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 400);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const openBookDetail = async (book) => {
    setSelectedBook(book);
    setDetailLoading(true);
    try {
      const detail = await booksApi.get(book.id);
      setBookDetail(detail);
    } catch {
      setBookDetail(book);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardShell role="student" title="Browse Library Catalog" subtitle="Search by title, author, category, or book ID">
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Search title, author, or ISBN..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </Select>
          <Select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="all">All Availability</option>
            <option value="available">Available Only</option>
            <option value="issued">Currently Issued</option>
          </Select>
        </CardContent>
      </Card>

      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}

      <div className="mt-6">
        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ISBN</TableHeaderCell>
              <TableHeaderCell>Title & Author</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Available / Total</TableHeaderCell>
              <TableHeaderCell>Details</TableHeaderCell>
            </TableRow>
          </TableHead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(5)].map((_, j) => (
                    <TableCell key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-vvitu-gold-dark" />
                  <p className="text-sm font-semibold text-vvitu-navy">No books found</p>
                  <p className="text-xs text-slate-500">Try adjusting your search or filters</p>
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
                  <TableCell><Badge variant="navy">{book.category}</Badge></TableCell>
                  <TableCell>
                    <span className={book.available_copies > 0 ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>
                      {book.available_copies}
                    </span>
                    <span className="text-slate-400"> / {book.total_copies}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => openBookDetail(book)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </TableContainer>
      </div>

      <Dialog open={Boolean(selectedBook)} onClose={() => { setSelectedBook(null); setBookDetail(null); }} title={selectedBook?.title || "Book Details"} description={`by ${selectedBook?.author}`}>
        {detailLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-6 animate-pulse rounded bg-slate-100" />)}</div>
        ) : bookDetail ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-vvitu-cream p-3"><p className="font-semibold text-vvitu-navy">ISBN</p><p className="mt-0.5 text-slate-600">{bookDetail.isbn}</p></div>
              <div className="rounded-lg bg-vvitu-cream p-3"><p className="font-semibold text-vvitu-navy">Category</p><p className="mt-0.5 text-slate-600">{bookDetail.category}</p></div>
              <div className="rounded-lg bg-vvitu-cream p-3"><p className="font-semibold text-vvitu-navy">Publisher</p><p className="mt-0.5 text-slate-600">{bookDetail.publisher || "N/A"}</p></div>
              <div className="rounded-lg bg-vvitu-cream p-3"><p className="font-semibold text-vvitu-navy">Year</p><p className="mt-0.5 text-slate-600">{bookDetail.publication_year || "N/A"}</p></div>
            </div>
            {bookDetail.description && <p className="text-xs text-slate-600 leading-relaxed">{bookDetail.description}</p>}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <span className="text-xs font-semibold text-emerald-800">Available Copies</span>
              <span className={`text-lg font-extrabold ${bookDetail.available_copies > 0 ? "text-emerald-700" : "text-red-600"}`}>
                {bookDetail.available_copies} / {bookDetail.total_copies}
              </span>
            </div>
            <p className="text-xs text-slate-500 italic">To borrow this book, visit the library desk. The librarian will issue the physical copy.</p>
            <Button variant="outline" className="w-full" onClick={() => { setSelectedBook(null); setBookDetail(null); }}>Close</Button>
          </div>
        ) : null}
      </Dialog>
    </DashboardShell>
  );
}

export default function StudentCatalogPage() {
  return <ProtectedRoute allowedRoles={["student"]}><CatalogContent /></ProtectedRoute>;
}
