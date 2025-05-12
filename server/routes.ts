import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertBookSchema,
  insertBorrowSchema,
  insertLibraryInfoSchema,
  updateProfileSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Books API endpoints - доступно гостям
  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getAllBooks();
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res.status(403).json({ message: "Only librarians can add books" });
    }

    try {
      const bookData = insertBookSchema.parse(req.body);
      const newBook = await storage.createBook(bookData);
      res.status(201).json(newBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can update books" });
    }

    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.parse(req.body);
      const updatedBook = await storage.updateBook(id, bookData);
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(updatedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  // Удаление книги
  app.delete("/api/books/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Только библиотекари могут удалять книги" });
    } // Проверка на роль библиотекаря
    // Обработка удаление книги
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBook(id); // Удаление книги из хранилища
      if (!deleted) {
        return res.status(404).json({ message: "Книга не найдена" });
      } // Проверка на успешность удаления
      res.status(204).send(); // Успешный ответ без тела
    } catch (error) {
      res.status(500).json({ message: "Не удалось удалить книгу" }); // Обработка ошибок
    }
  });

  // Borrowing API endpoints
  app.get("/api/borrows", async (req, res) => {
    try {
      let borrows;
      if (req.user?.role === "librarian") {
        borrows = await storage.getAllBorrows();
      } else {
        borrows = await storage.getBorrowsByUserId(req.user?.id || 0);
      }
      res.json(borrows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch borrows" });
    }
  });

  app.post("/api/borrows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res
        .status(401)
        .json({ message: "You must be logged in to borrow books" });
    }

    // Проверка на блокировку пользователя
    if (req.user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Your account is blocked. You cannot borrow books." });
    }

    try {
      console.log("Borrow request body:", req.body);
      const borrowData = insertBorrowSchema.parse(req.body);
      console.log("Parsed borrow data:", borrowData);

      // Check if the book is available
      const book = await storage.getBook(borrowData.bookId);
      if (!book) {
        console.log("Book not found, ID:", borrowData.bookId);
        return res.status(404).json({ message: "Book not found" });
      }

      console.log("Book found:", book);

      if (book.status !== "available") {
        console.log("Book not available, status:", book.status);
        return res
          .status(400)
          .json({ message: "Book is not available for borrowing" });
      }

      // Create the borrow record (status is updated inside createBorrow)
      const newBorrow = await storage.createBorrow(borrowData);
      console.log("Borrow created:", newBorrow);

      res.status(201).json(newBorrow);
    } catch (error: any) {
      console.error("Error creating borrow:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.errors);
        return res.status(400).json({ message: error.errors });
      }
      res
        .status(500)
        .json({
          message: "Failed to create borrow record",
          error: error.toString(),
        });
    }
  });

  app.put("/api/borrows/:id/return", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res
        .status(401)
        .json({ message: "You must be logged in to return books" });
    }

    // Проверка на блокировку пользователя (не применяется к библиотекарям)
    if (req.user.isBlocked && req.user.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Your account is blocked. You cannot return books." });
    }

    try {
      const id = parseInt(req.params.id);
      const borrow = await storage.getBorrow(id);

      if (!borrow) {
        return res.status(404).json({ message: "Borrow record not found" });
      }

      // Only the borrower or a librarian can return the book
      if (req.user?.role !== "librarian" && req.user?.id !== borrow.userId) {
        return res
          .status(403)
          .json({ message: "You don't have permission to return this book" });
      }

      // Update the borrow record with the return date
      const returnDate = new Date();
      const updatedBorrow = await storage.updateBorrow(id, { returnDate });

      // Update the book status back to available
      const book = await storage.getBook(borrow.bookId);
      if (book) {
        await storage.updateBook(book.id, { ...book, status: "available" });
      }

      res.json(updatedBorrow);
    } catch (error: any) {
      console.error("Error returning book:", error);
      res
        .status(500)
        .json({ message: "Failed to return book", error: error.toString() });
    }
  });

  // Search API endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const { query, field } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }

      const searchField = (field as string) || "all";
      const results = await storage.searchBooks(query, searchField);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search books" });
    }
  });

  // Получение списка всех жанров книг
  app.get("/api/genres", async (req, res) => {
    try {
      const genres = await storage.getAllGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  // Поиск книг по жанру
  app.get("/api/books/genre/:genre", async (req, res) => {
    try {
      const genre = req.params.genre;
      const books = await storage.getBooksByGenre(genre);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books by genre" });
    }
  });

  // Stats API endpoint for admin dashboard
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can access stats" });
    }

    try {
      const totalBooks = await storage.getTotalBooks();
      const totalUsers = await storage.getTotalUsers();
      const borrowedBooks = await storage.getBorrowedBooksCount();
      const overdueBooks = await storage.getOverdueBooks();

      res.json({
        totalBooks,
        totalUsers,
        borrowedBooks,
        overdueBooks: overdueBooks.length,
        recentActivity: await storage.getRecentActivity(),
        popularBooks: await storage.getPopularBooks(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Users API endpoints
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can view all users" });
    }

    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information like passwords
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Если пользователь запрашивает не свой профиль и не является библиотекарем
      if (
        !req.isAuthenticated() ||
        (req.user?.id !== id && req.user?.role !== "librarian")
      ) {
        return res
          .status(403)
          .json({ message: "You don't have permission to view this user" });
      }

      // Не передаем пароль
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch("/api/users/:id/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res
        .status(401)
        .json({ message: "You must be logged in to update profile" });
    }

    try {
      const id = parseInt(req.params.id);

      // Пользователь может обновить только свой профиль
      if (req.user?.id !== id) {
        return res
          .status(403)
          .json({ message: "You can only update your own profile" });
      }

      const profileData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(id, profileData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Не передаем пароль
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Toggle user block status (librarian only)
  app.patch("/api/users/:id/toggle-block", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can block/unblock users" });
    }

    try {
      const id = parseInt(req.params.id);

      // Нельзя заблокировать себя
      if (req.user?.id === id) {
        return res.status(400).json({ message: "You cannot block yourself" });
      }

      const updatedUser = await storage.toggleUserBlocked(id);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Не передаем пароль
      const { password, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle user block status" });
    }
  });

  // Library Info API endpoints
  app.get("/api/library-info", async (req, res) => {
    try {
      const info = await storage.getLibraryInfo();
      if (!info) {
        return res
          .status(404)
          .json({ message: "Library information not found" });
      }
      res.json(info);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch library information" });
    }
  });

  app.put("/api/library-info", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can update library information" });
    }

    try {
      const infoData = insertLibraryInfoSchema.parse(req.body);
      const updatedInfo = await storage.updateLibraryInfo(infoData);
      res.json(updatedInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update library information" });
    }
  });

  // Libraries API endpoints (multiple libraries)
  app.get("/api/libraries", async (req, res) => {
    try {
      const libraries = await storage.getAllLibraries();
      res.json(libraries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch libraries" });
    }
  });

  app.get("/api/libraries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const library = await storage.getLibrary(id);
      if (!library) {
        return res.status(404).json({ message: "Library not found" });
      }
      res.json(library);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch library" });
    }
  });

  app.post("/api/libraries", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can add libraries" });
    }

    try {
      const libraryData = insertLibraryInfoSchema.parse(req.body);
      const newLibrary = await storage.createLibrary(libraryData);
      res.status(201).json(newLibrary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create library" });
    }
  });

  app.patch("/api/libraries/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can update libraries" });
    }

    try {
      const id = parseInt(req.params.id);
      const libraryData = insertLibraryInfoSchema.parse(req.body);
      const updatedLibrary = await storage.updateLibrary(id, libraryData);
      if (!updatedLibrary) {
        return res.status(404).json({ message: "Library not found" });
      }
      res.json(updatedLibrary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update library" });
    }
  });

  app.delete("/api/libraries/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can delete libraries" });
    }

    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLibrary(id);
      if (!deleted) {
        return res.status(404).json({ message: "Library not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete library" });
    }
  });

  // Book-Library relationships API endpoints
  app.get("/api/books/:id/libraries", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const bookLibraries = await storage.getBookLibraries(bookId);
      res.json(bookLibraries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch book libraries" });
    }
  });

  app.get("/api/libraries/:id/books", async (req, res) => {
    try {
      const libraryId = parseInt(req.params.id);
      const libraryBooks = await storage.getLibraryBooks(libraryId);
      res.json(libraryBooks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch library books" });
    }
  });

  app.post("/api/book-libraries", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can add books to libraries" });
    }

    try {
      const { bookId, libraryId, quantity } = req.body;
      const bookLibrary = await storage.addBookToLibrary({
        bookId: parseInt(bookId),
        libraryId: parseInt(libraryId),
        quantity: parseInt(quantity),
      });
      res.status(201).json(bookLibrary);
    } catch (error) {
      res.status(500).json({ message: "Failed to add book to library" });
    }
  });

  app.patch("/api/book-libraries", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can update book quantities" });
    }

    try {
      const { bookId, libraryId, quantity } = req.body;
      const updated = await storage.updateBookInLibrary(
        parseInt(bookId),
        parseInt(libraryId),
        { quantity: parseInt(quantity) },
      );
      if (!updated) {
        return res
          .status(404)
          .json({ message: "Book-library relationship not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update book quantity" });
    }
  });

  app.delete("/api/book-libraries", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "librarian") {
      return res
        .status(403)
        .json({ message: "Only librarians can remove books from libraries" });
    }

    try {
      const { bookId, libraryId } = req.body;
      const deleted = await storage.removeBookFromLibrary(
        parseInt(bookId),
        parseInt(libraryId),
      );
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Book-library relationship not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove book from library" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
