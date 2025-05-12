import { users, type User, type InsertUser, type UpdateProfile, books, type Book, type InsertBook, borrows, type Borrow, type InsertBorrow, libraryInfo, type LibraryInfo, type InsertLibraryInfo, bookLibraries, type BookLibrary, type InsertBookLibrary } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, desc, sql, count, and, isNull, lt } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined>;
  toggleUserBlocked(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getTotalUsers(): Promise<number>;
  
  // Book operations
  getBook(id: number): Promise<Book | undefined>;
  getAllBooks(): Promise<Book[]>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<Book>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  searchBooks(query: string, field?: string): Promise<Book[]>;
  getTotalBooks(): Promise<number>;
  getBorrowedBooksCount(): Promise<number>;
  getOverdueBooks(): Promise<Borrow[]>;
  getPopularBooks(): Promise<{id: number, title: string, borrowCount: number}[]>;
  getAllGenres(): Promise<string[]>;
  getBooksByGenre(genre: string): Promise<Book[]>;
  
  // Library operations
  getAllLibraries(): Promise<LibraryInfo[]>;
  getLibrary(id: number): Promise<LibraryInfo | undefined>;
  createLibrary(info: InsertLibraryInfo): Promise<LibraryInfo>;
  updateLibrary(id: number, info: Partial<LibraryInfo>): Promise<LibraryInfo | undefined>;
  deleteLibrary(id: number): Promise<boolean>;
  
  // Book-Library operations
  getBookLibraries(bookId: number): Promise<(BookLibrary & { library: LibraryInfo })[]>;
  getLibraryBooks(libraryId: number): Promise<(BookLibrary & { book: Book })[]>;
  addBookToLibrary(bookLibrary: InsertBookLibrary): Promise<BookLibrary>;
  updateBookInLibrary(bookId: number, libraryId: number, data: { quantity: number }): Promise<BookLibrary | undefined>;
  removeBookFromLibrary(bookId: number, libraryId: number): Promise<boolean>;
  
  // Borrow operations
  getBorrow(id: number): Promise<Borrow | undefined>;
  getAllBorrows(): Promise<Borrow[]>;
  getBorrowsByUserId(userId: number): Promise<Borrow[]>;
  createBorrow(borrow: InsertBorrow): Promise<Borrow>;
  updateBorrow(id: number, update: Partial<Borrow>): Promise<Borrow | undefined>;
  
  // Activity
  getRecentActivity(): Promise<{
    type: string,
    userId: number,
    username: string,
    bookId?: number,
    bookTitle?: string,
    timestamp: Date
  }[]>;
  
  // Library Info operations
  getLibraryInfo(): Promise<LibraryInfo | undefined>;
  updateLibraryInfo(info: InsertLibraryInfo): Promise<LibraryInfo>;

  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private booksStore: Map<number, Book>;
  private borrowsStore: Map<number, Borrow>;
  private librariesStore: Map<number, LibraryInfo>;
  private bookLibrariesStore: Map<string, BookLibrary>; // ключ: `${bookId}-${libraryId}`
  private activityLog: {
    type: string,
    userId: number,
    username: string,
    bookId?: number,
    bookTitle?: string,
    timestamp: Date
  }[];
  public sessionStore: any;
  private userIdCounter: number;
  private bookIdCounter: number;
  private borrowIdCounter: number;
  private libraryIdCounter: number;

  constructor() {
    this.usersStore = new Map();
    this.booksStore = new Map();
    this.borrowsStore = new Map();
    this.librariesStore = new Map();
    this.bookLibrariesStore = new Map();
    this.activityLog = [];
    this.userIdCounter = 1;
    this.bookIdCounter = 1;
    this.borrowIdCounter = 1;
    this.libraryIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Seed a librarian user
    this.createUser({
      username: "admin",
      password: "admin.salt", // Pre-hashed password
      name: "Admin User",
      email: "admin@mylibrary.com",
      role: "librarian"
    });
    
    // Seed some books
    this.seedBooks();
  }

  private seedBooks() {
    const sampleBooks = [
      { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction", year: 2020, status: "available" as const },
      { title: "Atomic Habits", author: "James Clear", genre: "Self-Help", year: 2018, status: "available" as const },
      { title: "Educated", author: "Tara Westover", genre: "Memoir", year: 2018, status: "borrowed" as const },
      { title: "Project Hail Mary", author: "Andy Weir", genre: "Science Fiction", year: 2021, status: "reserved" as const },
      { title: "Klara and the Sun", author: "Kazuo Ishiguro", genre: "Literary Fiction", year: 2021, status: "available" as const }
    ];
    
    sampleBooks.forEach(book => this.createBook(book));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure role is always set
    const userWithRole = {
      ...insertUser,
      role: insertUser.role || "reader" as const,
      isBlocked: false,
      phoneNumber: insertUser.phoneNumber || null,
      address: insertUser.address || null,
      bio: insertUser.bio || null
    };
    const user: User = { ...userWithRole, id };
    this.usersStore.set(id, user);
    
    this.addActivity({
      type: "user_created",
      userId: id,
      username: user.name,
      timestamp: new Date()
    });
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersStore.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersStore.set(id, updatedUser);
    
    this.addActivity({
      type: "user_updated",
      userId: id,
      username: updatedUser.name,
      timestamp: new Date()
    });
    
    return updatedUser;
  }
  
  async updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined> {
    const user = this.usersStore.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...profileData,
      // Сохраняем существующий пароль и роль
      password: user.password,
      role: user.role
    };
    
    this.usersStore.set(id, updatedUser);
    
    this.addActivity({
      type: "profile_updated",
      userId: id,
      username: updatedUser.name,
      timestamp: new Date()
    });
    
    return updatedUser;
  }
  
  async toggleUserBlocked(id: number): Promise<User | undefined> {
    const user = this.usersStore.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user,
      isBlocked: !user.isBlocked
    };
    
    this.usersStore.set(id, updatedUser);
    
    this.addActivity({
      type: updatedUser.isBlocked ? "user_blocked" : "user_unblocked",
      userId: id,
      username: updatedUser.name,
      timestamp: new Date()
    });
    
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersStore.values());
  }

  async getTotalUsers(): Promise<number> {
    return this.usersStore.size;
  }

  // Book operations
  async getBook(id: number): Promise<Book | undefined> {
    return this.booksStore.get(id);
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.booksStore.values());
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    // Ensure status is always set
    const bookWithStatus = {
      ...book,
      status: book.status || "available" as const
    };
    const newBook = { ...bookWithStatus, id };
    this.booksStore.set(id, newBook);
    
    this.addActivity({
      type: "book_added",
      userId: 1, // Default to admin user
      username: "Admin User",
      bookId: id,
      bookTitle: book.title,
      timestamp: new Date()
    });
    
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const book = this.booksStore.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...updates };
    this.booksStore.set(id, updatedBook);
    
    this.addActivity({
      type: "book_updated",
      userId: 1, // Default to admin user
      username: "Admin User",
      bookId: id,
      bookTitle: updatedBook.title,
      timestamp: new Date()
    });
    
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    const book = this.booksStore.get(id);
    if (!book) return false;
    
    const deleted = this.booksStore.delete(id);
    
    if (deleted) {
      this.addActivity({
        type: "book_deleted",
        userId: 1,
        username: "Admin User",
        bookId: id,
        bookTitle: book.title,
        timestamp: new Date()
      });
    }
    
    return deleted;
  }

  async searchBooks(query: string, field: string = "all"): Promise<Book[]> {
    const books = Array.from(this.booksStore.values());
    const lowerQuery = query.toLowerCase();
    
    return books.filter(book => {
      if (field === "title" || field === "all") {
        if (book.title.toLowerCase().includes(lowerQuery)) return true;
      }
      if (field === "author" || field === "all") {
        if (book.author.toLowerCase().includes(lowerQuery)) return true;
      }
      if (field === "genre" || field === "all") {
        if (book.genre.toLowerCase().includes(lowerQuery)) return true;
      }
      return false;
    });
  }

  async getTotalBooks(): Promise<number> {
    return this.booksStore.size;
  }

  async getBorrowedBooksCount(): Promise<number> {
    const books = Array.from(this.booksStore.values());
    return books.filter(book => book.status === "borrowed").length;
  }

  async getOverdueBooks(): Promise<Borrow[]> {
    const now = new Date();
    const borrows = Array.from(this.borrowsStore.values());
    
    return borrows.filter(borrow => {
      return !borrow.returnDate && new Date(borrow.dueDate) < now;
    });
  }

  async getPopularBooks(): Promise<{id: number, title: string, borrowCount: number}[]> {
    const borrowCounts = new Map<number, number>();
    
    // Count borrows per book
    Array.from(this.borrowsStore.values()).forEach(borrow => {
      const count = borrowCounts.get(borrow.bookId) || 0;
      borrowCounts.set(borrow.bookId, count + 1);
    });
    
    // Create array of book counts
    const bookCounts = Array.from(borrowCounts.entries()).map(([bookId, count]) => {
      const book = this.booksStore.get(bookId);
      return {
        id: bookId,
        title: book?.title || "Unknown Book",
        borrowCount: count
      };
    });
    
    // Sort by count (descending)
    return bookCounts.sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 3);
  }
  
  // Жанры книг
  async getAllGenres(): Promise<string[]> {
    const books = Array.from(this.booksStore.values());
    const genresSet = new Set<string>();
    
    books.forEach(book => {
      if (book.genre) {
        genresSet.add(book.genre);
      }
    });
    
    return Array.from(genresSet);
  }
  
  async getBooksByGenre(genre: string): Promise<Book[]> {
    const books = Array.from(this.booksStore.values());
    return books.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
  }

  // Borrow operations
  async getBorrow(id: number): Promise<Borrow | undefined> {
    return this.borrowsStore.get(id);
  }

  async getAllBorrows(): Promise<Borrow[]> {
    return Array.from(this.borrowsStore.values());
  }

  async getBorrowsByUserId(userId: number): Promise<Borrow[]> {
    return Array.from(this.borrowsStore.values()).filter(
      borrow => borrow.userId === userId
    );
  }

  async createBorrow(borrow: InsertBorrow): Promise<Borrow> {
    const id = this.borrowIdCounter++;
    const newBorrow: Borrow = { 
      ...borrow, 
      id, 
      returnDate: null 
    };
    
    this.borrowsStore.set(id, newBorrow);
    
    const user = this.usersStore.get(borrow.userId);
    const book = this.booksStore.get(borrow.bookId);
    
    this.addActivity({
      type: "book_borrowed",
      userId: borrow.userId,
      username: user?.name || "Unknown User",
      bookId: borrow.bookId,
      bookTitle: book?.title || "Unknown Book",
      timestamp: new Date()
    });
    
    return newBorrow;
  }

  async updateBorrow(id: number, update: Partial<Borrow>): Promise<Borrow | undefined> {
    const borrow = this.borrowsStore.get(id);
    if (!borrow) return undefined;
    
    const updatedBorrow = { ...borrow, ...update };
    this.borrowsStore.set(id, updatedBorrow);
    
    if (update.returnDate) {
      const user = this.usersStore.get(borrow.userId);
      const book = this.booksStore.get(borrow.bookId);
      
      this.addActivity({
        type: "book_returned",
        userId: borrow.userId,
        username: user?.name || "Unknown User",
        bookId: borrow.bookId,
        bookTitle: book?.title || "Unknown Book",
        timestamp: new Date()
      });
    }
    
    return updatedBorrow;
  }

  // Activity logging
  private addActivity(activity: {
    type: string,
    userId: number,
    username: string,
    bookId?: number,
    bookTitle?: string,
    timestamp: Date
  }) {
    this.activityLog.unshift(activity);
    // Keep only the 20 most recent activities
    if (this.activityLog.length > 20) {
      this.activityLog = this.activityLog.slice(0, 20);
    }
  }

  async getRecentActivity() {
    return this.activityLog;
  }

  // Library operations
  async getAllLibraries(): Promise<LibraryInfo[]> {
    return Array.from(this.librariesStore.values());
  }

  async getLibrary(id: number): Promise<LibraryInfo | undefined> {
    return this.librariesStore.get(id);
  }

  async createLibrary(info: InsertLibraryInfo): Promise<LibraryInfo> {
    const id = this.libraryIdCounter++;
    // Ensure description and logoUrl are never undefined
    const safeInfo = {
      ...info,
      description: info.description ?? null,
      logoUrl: info.logoUrl ?? null
    };

    const newLibrary: LibraryInfo = {
      id,
      ...safeInfo,
      updatedAt: new Date()
    };

    this.librariesStore.set(id, newLibrary);

    this.addActivity({
      type: "library_created",
      userId: 1, // Default to admin
      username: "Admin User",
      timestamp: new Date()
    });

    return newLibrary;
  }

  async updateLibrary(id: number, info: Partial<LibraryInfo>): Promise<LibraryInfo | undefined> {
    const library = this.librariesStore.get(id);
    if (!library) return undefined;

    const updatedLibrary = { 
      ...library, 
      ...info,
      updatedAt: new Date() 
    };

    this.librariesStore.set(id, updatedLibrary);

    this.addActivity({
      type: "library_updated",
      userId: 1, // Default to admin
      username: "Admin User",
      timestamp: new Date()
    });

    return updatedLibrary;
  }

  async deleteLibrary(id: number): Promise<boolean> {
    const library = this.librariesStore.get(id);
    if (!library) return false;

    // Удаляем все связи книг с этой библиотекой
    for (const [key, value] of this.bookLibrariesStore.entries()) {
      if (value.libraryId === id) {
        this.bookLibrariesStore.delete(key);
      }
    }

    const deleted = this.librariesStore.delete(id);

    if (deleted) {
      this.addActivity({
        type: "library_deleted",
        userId: 1, // Default to admin
        username: "Admin User",
        timestamp: new Date()
      });
    }

    return deleted;
  }

  // Book-Library operations
  async getBookLibraries(bookId: number): Promise<(BookLibrary & { library: LibraryInfo })[]> {
    const entries = Array.from(this.bookLibrariesStore.values())
      .filter(entry => entry.bookId === bookId);

    return entries.map(entry => {
      const library = this.librariesStore.get(entry.libraryId);
      return {
        ...entry,
        library: library || {
          id: entry.libraryId,
          name: "Неизвестная библиотека",
          address: "",
          phone: "",
          email: "",
          openHours: "",
          description: null,
          logoUrl: null,
          updatedAt: new Date()
        }
      };
    });
  }

  async getLibraryBooks(libraryId: number): Promise<(BookLibrary & { book: Book })[]> {
    const entries = Array.from(this.bookLibrariesStore.values())
      .filter(entry => entry.libraryId === libraryId);

    return entries.map(entry => {
      const book = this.booksStore.get(entry.bookId);
      return {
        ...entry,
        book: book || {
          id: entry.bookId,
          title: "Неизвестная книга",
          author: "Неизвестный автор",
          genre: "Неизвестный жанр",
          year: 0,
          status: "available"
        }
      };
    });
  }

  async addBookToLibrary(bookLibrary: InsertBookLibrary): Promise<BookLibrary> {
    const { bookId, libraryId, quantity } = bookLibrary;
    const key = `${bookId}-${libraryId}`;
    
    const entry: BookLibrary = {
      bookId,
      libraryId,
      quantity: quantity || 1
    };

    this.bookLibrariesStore.set(key, entry);

    const book = this.booksStore.get(bookId);
    const library = this.librariesStore.get(libraryId);

    this.addActivity({
      type: "book_added_to_library",
      userId: 1, // Default to admin
      username: "Admin User",
      bookId,
      bookTitle: book?.title || "Неизвестная книга",
      timestamp: new Date()
    });

    return entry;
  }

  async updateBookInLibrary(bookId: number, libraryId: number, data: { quantity: number }): Promise<BookLibrary | undefined> {
    const key = `${bookId}-${libraryId}`;
    const entry = this.bookLibrariesStore.get(key);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...data };
    this.bookLibrariesStore.set(key, updatedEntry);

    return updatedEntry;
  }

  async removeBookFromLibrary(bookId: number, libraryId: number): Promise<boolean> {
    const key = `${bookId}-${libraryId}`;
    const entry = this.bookLibrariesStore.get(key);
    if (!entry) return false;

    const deleted = this.bookLibrariesStore.delete(key);

    if (deleted) {
      const book = this.booksStore.get(bookId);
      this.addActivity({
        type: "book_removed_from_library",
        userId: 1, // Default to admin
        username: "Admin User",
        bookId,
        bookTitle: book?.title || "Неизвестная книга",
        timestamp: new Date()
      });
    }

    return deleted;
  }

  // Library Info operations - для совместимости с предыдущим кодом
  async getLibraryInfo(): Promise<LibraryInfo | undefined> {
    const libraries = await this.getAllLibraries();
    return libraries.length > 0 ? libraries[0] : undefined;
  }

  async updateLibraryInfo(info: InsertLibraryInfo): Promise<LibraryInfo> {
    const libraries = await this.getAllLibraries();
    if (libraries.length > 0) {
      return this.updateLibrary(libraries[0].id, info) as Promise<LibraryInfo>;
    } else {
      return this.createLibrary(info);
    }
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async updateUserProfile(id: number, profileData: UpdateProfile): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const [updatedUser] = await db.update(users)
      .set(profileData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async toggleUserBlocked(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;
    
    const [updatedUser] = await db.update(users)
      .set({ isBlocked: !user.isBlocked })
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure role is set to either "librarian" or "reader"
    const userWithRole = {
      ...insertUser,
      role: insertUser.role || "reader"
    };
    
    const [user] = await db.insert(users).values(userWithRole).returning();
    
    await this.addActivity({
      type: "user_created",
      userId: user.id,
      username: user.name,
      timestamp: new Date()
    });
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getTotalUsers(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result?.count || 0;
  }

  // Book operations
  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async getAllBooks(): Promise<Book[]> {
    return db.select().from(books);
  }

  async createBook(book: InsertBook): Promise<Book> {
    // Ensure status is defined with a default value
    const bookWithStatus = {
      ...book,
      status: book.status || "available"
    };
    
    const [newBook] = await db.insert(books).values(bookWithStatus).returning();
    
    await this.addActivity({
      type: "book_added",
      userId: 1, // Default to admin
      username: "Admin",
      bookId: newBook.id,
      bookTitle: newBook.title,
      timestamp: new Date()
    });
    
    return newBook;
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book | undefined> {
    const [updatedBook] = await db
      .update(books)
      .set(updates)
      .where(eq(books.id, id))
      .returning();
    
    if (updatedBook) {
      await this.addActivity({
        type: "book_updated",
        userId: 1, // Default to admin user
        username: "Admin",
        bookId: id,
        bookTitle: updatedBook.title,
        timestamp: new Date()
      });
    }
    
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    
    if (!book) return false;
    
    await db.delete(books).where(eq(books.id, id));
    
    await this.addActivity({
      type: "book_deleted",
      userId: 1, // Default to admin user
      username: "Admin",
      bookId: id,
      bookTitle: book.title,
      timestamp: new Date()
    });
    
    return true;
  }

  async searchBooks(query: string, field: string = "all"): Promise<Book[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    
    if (field === "title") {
      return db.select().from(books).where(sql`lower(${books.title}) LIKE ${lowerQuery}`);
    } else if (field === "author") {
      return db.select().from(books).where(sql`lower(${books.author}) LIKE ${lowerQuery}`);
    } else if (field === "genre") {
      return db.select().from(books).where(sql`lower(${books.genre}) LIKE ${lowerQuery}`);
    } else {
      return db.select().from(books).where(
        sql`lower(${books.title}) LIKE ${lowerQuery} OR 
            lower(${books.author}) LIKE ${lowerQuery} OR 
            lower(${books.genre}) LIKE ${lowerQuery}`
      );
    }
  }

  async getTotalBooks(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(books);
    return result?.count || 0;
  }

  async getBorrowedBooksCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.status, "borrowed"));
    
    return result?.count || 0;
  }

  async getOverdueBooks(): Promise<Borrow[]> {
    const now = new Date();
    
    return db
      .select()
      .from(borrows)
      .where(
        and(
          isNull(borrows.returnDate),
          lt(borrows.dueDate, now)
        )
      );
  }

  async getPopularBooks(): Promise<{id: number, title: string, borrowCount: number}[]> {
    const result = await db
      .select({
        id: books.id,
        title: books.title,
        borrowCount: count(borrows.id)
      })
      .from(books)
      .leftJoin(borrows, eq(books.id, borrows.bookId))
      .groupBy(books.id, books.title)
      .orderBy(desc(count(borrows.id)))
      .limit(3);
    
    return result;
  }
  
  // Методы для работы с жанрами
  async getAllGenres(): Promise<string[]> {
    const result = await db
      .selectDistinct({ genre: books.genre })
      .from(books)
      .where(sql`${books.genre} IS NOT NULL AND ${books.genre} != ''`)
      .orderBy(books.genre);
      
    return result.map(item => item.genre);
  }
  
  async getBooksByGenre(genre: string): Promise<Book[]> {
    return db
      .select()
      .from(books)
      .where(sql`LOWER(${books.genre}) = LOWER(${genre})`);
  }

  // Borrow operations
  async getBorrow(id: number): Promise<Borrow | undefined> {
    const [borrow] = await db.select().from(borrows).where(eq(borrows.id, id));
    return borrow;
  }

  async getAllBorrows(): Promise<Borrow[]> {
    return db.select().from(borrows);
  }

  async getBorrowsByUserId(userId: number): Promise<Borrow[]> {
    return db.select().from(borrows).where(eq(borrows.userId, userId));
  }

  async createBorrow(borrow: InsertBorrow): Promise<Borrow> {
    const [newBorrow] = await db.insert(borrows).values({
      ...borrow,
      returnDate: null
    }).returning();
    
    // Also update the book status to "borrowed"
    await db
      .update(books)
      .set({ status: "borrowed" })
      .where(eq(books.id, borrow.bookId));
    
    const [user] = await db.select().from(users).where(eq(users.id, borrow.userId));
    const [book] = await db.select().from(books).where(eq(books.id, borrow.bookId));
    
    await this.addActivity({
      type: "book_borrowed",
      userId: borrow.userId,
      username: user?.name || "Unknown User",
      bookId: borrow.bookId,
      bookTitle: book?.title || "Unknown Book",
      timestamp: new Date()
    });
    
    return newBorrow;
  }

  async updateBorrow(id: number, update: Partial<Borrow>): Promise<Borrow | undefined> {
    const [updatedBorrow] = await db
      .update(borrows)
      .set(update)
      .where(eq(borrows.id, id))
      .returning();
    
    if (!updatedBorrow) return undefined;
    
    if (update.returnDate) {
      // Update the book status back to "available"
      await db
        .update(books)
        .set({ status: "available" })
        .where(eq(books.id, updatedBorrow.bookId));
      
      const [user] = await db.select().from(users).where(eq(users.id, updatedBorrow.userId));
      const [book] = await db.select().from(books).where(eq(books.id, updatedBorrow.bookId));
      
      await this.addActivity({
        type: "book_returned",
        userId: updatedBorrow.userId,
        username: user?.name || "Unknown User",
        bookId: updatedBorrow.bookId,
        bookTitle: book?.title || "Unknown Book",
        timestamp: new Date()
      });
    }
    
    return updatedBorrow;
  }

  // We'll store activity in the database in a future update
  // For now, we'll keep the last 20 activities in memory
  private activityLog: {
    type: string,
    userId: number,
    username: string,
    bookId?: number,
    bookTitle?: string,
    timestamp: Date
  }[] = [];

  private async addActivity(activity: {
    type: string,
    userId: number,
    username: string,
    bookId?: number,
    bookTitle?: string,
    timestamp: Date
  }) {
    this.activityLog.unshift(activity);
    // Keep only the 20 most recent activities
    if (this.activityLog.length > 20) {
      this.activityLog = this.activityLog.slice(0, 20);
    }
  }

  async getRecentActivity() {
    return this.activityLog;
  }

  // Library operations
  async getAllLibraries(): Promise<LibraryInfo[]> {
    return db.select().from(libraryInfo);
  }

  async getLibrary(id: number): Promise<LibraryInfo | undefined> {
    const [library] = await db.select().from(libraryInfo).where(eq(libraryInfo.id, id));
    return library;
  }

  async createLibrary(info: InsertLibraryInfo): Promise<LibraryInfo> {
    // Ensure description and logoUrl are never undefined
    const safeInfo = {
      ...info,
      description: info.description ?? null,
      logoUrl: info.logoUrl ?? null
    };

    const [library] = await db
      .insert(libraryInfo)
      .values({
        ...safeInfo,
        updatedAt: new Date()
      })
      .returning();

    await this.addActivity({
      type: "library_created",
      userId: 1, // Default to admin
      username: "Admin",
      timestamp: new Date()
    });

    return library;
  }

  async updateLibrary(id: number, info: Partial<LibraryInfo>): Promise<LibraryInfo | undefined> {
    const [library] = await db
      .update(libraryInfo)
      .set({
        ...info,
        updatedAt: new Date()
      })
      .where(eq(libraryInfo.id, id))
      .returning();

    if (library) {
      await this.addActivity({
        type: "library_updated",
        userId: 1, // Default to admin
        username: "Admin",
        timestamp: new Date()
      });
    }

    return library;
  }

  async deleteLibrary(id: number): Promise<boolean> {
    const [library] = await db.select().from(libraryInfo).where(eq(libraryInfo.id, id));
    if (!library) return false;

    // Удаляем связи книг с библиотекой (каскадное удаление должно сработать автоматически)
    await db.delete(bookLibraries).where(eq(bookLibraries.libraryId, id));
    await db.delete(libraryInfo).where(eq(libraryInfo.id, id));

    await this.addActivity({
      type: "library_deleted",
      userId: 1, // Default to admin
      username: "Admin",
      timestamp: new Date()
    });

    return true;
  }

  // Book-Library operations
  async getBookLibraries(bookId: number): Promise<(BookLibrary & { library: LibraryInfo })[]> {
    return db
      .select({
        bookId: bookLibraries.bookId,
        libraryId: bookLibraries.libraryId,
        quantity: bookLibraries.quantity,
        library: libraryInfo
      })
      .from(bookLibraries)
      .leftJoin(libraryInfo, eq(bookLibraries.libraryId, libraryInfo.id))
      .where(eq(bookLibraries.bookId, bookId));
  }

  async getLibraryBooks(libraryId: number): Promise<(BookLibrary & { book: Book })[]> {
    return db
      .select({
        bookId: bookLibraries.bookId,
        libraryId: bookLibraries.libraryId,
        quantity: bookLibraries.quantity,
        book: books
      })
      .from(bookLibraries)
      .leftJoin(books, eq(bookLibraries.bookId, books.id))
      .where(eq(bookLibraries.libraryId, libraryId));
  }

  async addBookToLibrary(bookLibrary: InsertBookLibrary): Promise<BookLibrary> {
    // Проверяем, что книга и библиотека существуют
    const [book] = await db.select().from(books).where(eq(books.id, bookLibrary.bookId));
    const [library] = await db.select().from(libraryInfo).where(eq(libraryInfo.id, bookLibrary.libraryId));

    if (!book || !library) {
      throw new Error("Book or library does not exist");
    }

    // Проверяем, есть ли уже связь
    const [existing] = await db
      .select()
      .from(bookLibraries)
      .where(
        and(
          eq(bookLibraries.bookId, bookLibrary.bookId),
          eq(bookLibraries.libraryId, bookLibrary.libraryId)
        )
      );

    let result: BookLibrary;

    if (existing) {
      // Обновляем количество
      const [updated] = await db
        .update(bookLibraries)
        .set({ quantity: bookLibrary.quantity || existing.quantity + 1 })
        .where(
          and(
            eq(bookLibraries.bookId, bookLibrary.bookId),
            eq(bookLibraries.libraryId, bookLibrary.libraryId)
          )
        )
        .returning();
      
      result = updated;
    } else {
      // Создаем новую связь
      const [created] = await db
        .insert(bookLibraries)
        .values({
          bookId: bookLibrary.bookId,
          libraryId: bookLibrary.libraryId,
          quantity: bookLibrary.quantity || 1
        })
        .returning();
      
      result = created;
    }

    await this.addActivity({
      type: "book_added_to_library",
      userId: 1, // Default to admin
      username: "Admin",
      bookId: bookLibrary.bookId,
      bookTitle: book.title,
      timestamp: new Date()
    });

    return result;
  }

  async updateBookInLibrary(bookId: number, libraryId: number, data: { quantity: number }): Promise<BookLibrary | undefined> {
    const [updated] = await db
      .update(bookLibraries)
      .set(data)
      .where(
        and(
          eq(bookLibraries.bookId, bookId),
          eq(bookLibraries.libraryId, libraryId)
        )
      )
      .returning();
    
    return updated;
  }

  async removeBookFromLibrary(bookId: number, libraryId: number): Promise<boolean> {
    const [book] = await db.select().from(books).where(eq(books.id, bookId));
    if (!book) return false;

    await db
      .delete(bookLibraries)
      .where(
        and(
          eq(bookLibraries.bookId, bookId),
          eq(bookLibraries.libraryId, libraryId)
        )
      );

    await this.addActivity({
      type: "book_removed_from_library",
      userId: 1, // Default to admin
      username: "Admin",
      bookId: bookId,
      bookTitle: book.title,
      timestamp: new Date()
    });

    return true;
  }

  // Library Info operations - для совместимости с предыдущим кодом
  async getLibraryInfo(): Promise<LibraryInfo | undefined> {
    const libraries = await this.getAllLibraries();
    return libraries.length > 0 ? libraries[0] : undefined;
  }

  async updateLibraryInfo(info: InsertLibraryInfo): Promise<LibraryInfo> {
    const libraries = await this.getAllLibraries();
    if (libraries.length > 0) {
      const updated = await this.updateLibrary(libraries[0].id, info);
      if (updated) return updated;
    }
    
    return this.createLibrary(info);
  }
}

// Use the database storage implementation
export const storage = new DatabaseStorage();
