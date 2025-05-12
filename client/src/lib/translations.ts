export type Language = 'ru' | 'en';

export type Translations = {
  [key: string]: {
    [language in Language]: string;
  };
};

export const translations: Translations = {
  // Theme
  'switch_to_dark': {
    en: 'Switch to dark theme',
    ru: 'Переключить на тёмную тему'
  },
  'switch_to_light': {
    en: 'Switch to light theme',
    ru: 'Переключить на светлую тему'
  },
  // Profile page
  'profile.title': {
    en: 'My Profile',
    ru: 'Мой профиль'
  },
  'profile.info': {
    en: 'Profile Information',
    ru: 'Информация профиля'
  },
  'profile.borrowings': {
    en: 'My Borrowings',
    ru: 'Мои выдачи'
  },
  'profile.personalInfo': {
    en: 'Personal Information',
    ru: 'Личная информация'
  },
  'profile.personalInfoDesc': {
    en: 'Update your personal information',
    ru: 'Обновите свою личную информацию'
  },
  'profile.accountInfo': {
    en: 'Account Information',
    ru: 'Информация об аккаунте'
  },
  'profile.accountInfoDesc': {
    en: 'Your account details',
    ru: 'Детали вашего аккаунта'
  },
  'profile.name': {
    en: 'Full Name',
    ru: 'Полное имя'
  },
  'profile.email': {
    en: 'Email',
    ru: 'Электронная почта'
  },
  'profile.phone': {
    en: 'Phone Number',
    ru: 'Номер телефона'
  },
  'profile.address': {
    en: 'Address',
    ru: 'Адрес'
  },
  'profile.bio': {
    en: 'Bio',
    ru: 'О себе'
  },
  'profile.username': {
    en: 'Username',
    ru: 'Имя пользователя'
  },
  'profile.role': {
    en: 'Role',
    ru: 'Роль'
  },
  'profile.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'profile.active': {
    en: 'Active',
    ru: 'Активен'
  },
  'profile.blocked': {
    en: 'Blocked',
    ru: 'Заблокирован'
  },
  'profile.save': {
    en: 'Save Changes',
    ru: 'Сохранить изменения'
  },
  'profile.updated': {
    en: 'Profile Updated',
    ru: 'Профиль обновлен'
  },
  'profile.updateSuccess': {
    en: 'Your profile has been updated successfully',
    ru: 'Ваш профиль был успешно обновлен'
  },
  'profile.updateFailed': {
    en: 'Failed to Update',
    ru: 'Не удалось обновить'
  },
  'profile.borrowingsDesc': {
    en: 'History of your borrowed books',
    ru: 'История ваших выданных книг'
  },
  'profile.noBorrowings': {
    en: 'You have not borrowed any books yet',
    ru: 'Вы еще не брали книг'
  },
  // Auth page
  'auth.title': {
    en: 'Welcome to MyLibrary',
    ru: 'Добро пожаловать в МояБиблиотека'
  },
  'auth.login': {
    en: 'Login',
    ru: 'Вход'
  },
  'auth.feature.book_management': {
    en: 'Easy Book Management',
    ru: 'Простое управление книгами'
  },
  'auth.feature.book_management.desc': {
    en: 'Add, edit, and organize your book collection with ease.',
    ru: 'Добавляйте, редактируйте и организуйте вашу коллекцию книг с легкостью.'
  },
  'auth.feature.search': {
    en: 'Advanced Search',
    ru: 'Расширенный поиск'
  },
  'auth.feature.search.desc': {
    en: 'Instantly find books by title, author, or genre.',
    ru: 'Мгновенно находите книги по названию, автору или жанру.'
  },
  
  // Libraries page
  'libraries.title': {
    en: 'Libraries',
    ru: 'Библиотеки'
  },
  'libraries.add': {
    en: 'Add Library',
    ru: 'Добавить библиотеку'
  },
  'libraries.edit': {
    en: 'Edit Library',
    ru: 'Редактировать библиотеку'
  },
  'libraries.empty': {
    en: 'No libraries found. Add your first library!',
    ru: 'Библиотеки не найдены. Добавьте свою первую библиотеку!'
  },
  'libraries.created': {
    en: 'Library has been successfully created',
    ru: 'Библиотека успешно создана'
  },
  'libraries.updated': {
    en: 'Library has been successfully updated',
    ru: 'Библиотека успешно обновлена'
  },
  'libraries.deleted': {
    en: 'Library has been successfully deleted',
    ru: 'Библиотека успешно удалена'
  },
  'libraries.name': {
    en: 'Library Name',
    ru: 'Название библиотеки'
  },
  'libraries.address': {
    en: 'Address',
    ru: 'Адрес'
  },
  'libraries.phone': {
    en: 'Phone',
    ru: 'Телефон'
  },
  'libraries.email': {
    en: 'Email',
    ru: 'Электронная почта'
  },
  'libraries.openHours': {
    en: 'Opening Hours',
    ru: 'Часы работы'
  },
  'libraries.description': {
    en: 'Description',
    ru: 'Описание'
  },
  
  // Book Libraries
  'books.locationsTitle': {
    en: 'Book Locations',
    ru: 'Местонахождение книги'
  },
  'books.addToLibrary': {
    en: 'Add to Library',
    ru: 'Добавить в библиотеку'
  },
  'books.addToLibraryTitle': {
    en: 'Add Book to Library',
    ru: 'Добавить книгу в библиотеку'
  },
  'books.selectLibrary': {
    en: 'Select Library',
    ru: 'Выберите библиотеку'
  },
  'books.selectLibraryPlaceholder': {
    en: 'Select a library...',
    ru: 'Выберите библиотеку...'
  },
  'books.quantity': {
    en: 'Quantity',
    ru: 'Количество'
  },
  'books.notFoundInLibraries': {
    en: 'This book is not available in any library yet',
    ru: 'Эта книга пока не доступна ни в одной библиотеке'
  },
  'books.libraryName': {
    en: 'Library Name',
    ru: 'Название библиотеки'
  },
  'books.address': {
    en: 'Address',
    ru: 'Адрес'
  },
  'books.addedToLibrary': {
    en: 'Book has been added to the library',
    ru: 'Книга добавлена в библиотеку'
  },
  'books.removedFromLibrary': {
    en: 'Book has been removed from the library',
    ru: 'Книга удалена из библиотеки'
  },
  'books.quantityUpdated': {
    en: 'Book quantity has been updated',
    ru: 'Количество книг обновлено'
  },
  'books.manageLibraries': {
    en: 'Manage Libraries',
    ru: 'Управление библиотеками'
  },
  'books.librariesTitle': {
    en: 'Book in Libraries',
    ru: 'Книга в библиотеках'
  },
  'books.librariesDescription': {
    en: 'Manage this book\'s availability across different libraries',
    ru: 'Управление доступностью этой книги в разных библиотеках'
  },
  'books.confirmRemoveFromLibrary': {
    en: 'Are you sure you want to remove this book from the library?',
    ru: 'Вы уверены, что хотите удалить эту книгу из библиотеки?'
  },
  'books.updateQuantity': {
    en: 'Update Quantity',
    ru: 'Обновить количество'
  },
  'auth.feature.borrowing': {
    en: 'Borrowing System',
    ru: 'Система выдачи книг'
  },
  'auth.feature.borrowing.desc': {
    en: 'Track borrowed books and efficiently manage their return.',
    ru: 'Отслеживайте выданные книги и эффективно управляйте их возвратом.'
  },
  'error.password.match': {
    en: 'Passwords do not match',
    ru: 'Пароли не совпадают'
  },
  'auth.subtitle': {
    en: 'A modern library management system',
    ru: 'Современная система управления библиотекой'
  },
  'auth.login.title': {
    en: 'Login',
    ru: 'Вход'
  },
  'auth.login.subtitle': {
    en: 'Enter your credentials to access your account',
    ru: 'Введите свои данные для доступа к учетной записи'
  },
  'auth.register.title': {
    en: 'Register',
    ru: 'Регистрация'
  },
  'auth.register.subtitle': {
    en: 'Create a new account to get started',
    ru: 'Создайте новую учетную запись, чтобы начать'
  },
  'auth.username': {
    en: 'Username',
    ru: 'Имя пользователя'
  },
  'auth.username.placeholder': {
    en: 'Enter your username',
    ru: 'Введите имя пользователя'
  },
  'auth.password': {
    en: 'Password',
    ru: 'Пароль'
  },
  'auth.password.placeholder': {
    en: 'Enter your password',
    ru: 'Введите пароль'
  },
  'auth.password.confirm': {
    en: 'Confirmation',
    ru: 'Подтверждение'
  },
  'auth.password.confirm.placeholder': {
    en: 'Confirm your password',
    ru: 'Подтвердите пароль'
  },
  'auth.role.select': {
    en: 'Select a role',
    ru: 'Выберите роль'
  },
  'auth.name': {
    en: 'Full Name',
    ru: 'Полное имя'
  },
  'auth.name.placeholder': {
    en: 'Enter your full name',
    ru: 'Введите полное имя'
  },
  'auth.email': {
    en: 'Email',
    ru: 'Электронная почта'
  },
  'auth.email.placeholder': {
    en: 'Enter your email',
    ru: 'Введите электронную почту'
  },
  'auth.role': {
    en: 'Role',
    ru: 'Роль'
  },
  'auth.role.librarian': {
    en: 'Librarian',
    ru: 'Библиотекарь'
  },
  'auth.role.reader': {
    en: 'Reader',
    ru: 'Читатель'
  },
  'auth.login.button': {
    en: 'Login',
    ru: 'Войти'
  },
  'auth.register.button': {
    en: 'Register',
    ru: 'Зарегистрироваться'
  },
  'auth.register.link': {
    en: 'Don\'t have an account? Register',
    ru: 'Нет учетной записи? Зарегистрироваться'
  },
  'auth.login.link': {
    en: 'Already have an account? Login',
    ru: 'Уже есть учетная запись? Войти'
  },
  
  // Navigation and sidebar
  'nav.home': {
    en: 'Home',
    ru: 'Главная'
  },
  'nav.books': {
    en: 'Books',
    ru: 'Книги'
  },
  'nav.borrowing': {
    en: 'Borrowing',
    ru: 'Выдача книг'
  },
  'nav.libraries': {
    en: 'Libraries',
    ru: 'Библиотеки'
  },
  'nav.users': {
    en: 'Users',
    ru: 'Пользователи'
  },
  'nav.logout': {
    en: 'Logout',
    ru: 'Выйти'
  },
  'nav.dashboard': {
    en: 'Dashboard',
    ru: 'Главная'
  },
  'nav.settings': {
    en: 'Settings',
    ru: 'Настройки'
  },
  'nav.back': {
    en: 'Back',
    ru: 'Назад'
  },
  
  // Dashboard
  'dashboard.title': {
    en: 'Dashboard',
    ru: 'Панель управления'
  },
  'dashboard.welcome': {
    en: 'Welcome back',
    ru: 'Добро пожаловать'
  },
  'dashboard.subtitle': {
    en: 'Here\'s an overview of your library',
    ru: 'Обзор вашей библиотеки'
  },
  'dashboard.search': {
    en: 'Search...',
    ru: 'Поиск...'
  },
  'dashboard.addBook': {
    en: 'Add Book',
    ru: 'Добавить книгу'
  },
  'dashboard.stats.title': {
    en: 'Library Statistics',
    ru: 'Статистика библиотеки'
  },
  'dashboard.stats.books': {
    en: 'Total Books',
    ru: 'Всего книг'
  },
  'dashboard.stats.borrowed': {
    en: 'Borrowed Books',
    ru: 'Выданных книг'
  },
  'dashboard.stats.users': {
    en: 'Registered Users',
    ru: 'Зарегистрированных пользователей'
  },
  'dashboard.stats.totalBooks': {
    en: 'Total Books',
    ru: 'Всего книг'
  },
  'dashboard.stats.yourBorrows': {
    en: 'Your Borrows',
    ru: 'Ваши выдачи'
  },
  'dashboard.stats.activeBorrows': {
    en: 'Active Borrows',
    ru: 'Активных выдач'
  },
  'dashboard.stats.returnsNeeded': {
    en: 'Returns Needed',
    ru: 'Требуется возврат'
  },
  'dashboard.stats.booksBorrowed': {
    en: 'Books Borrowed',
    ru: 'Взятых книг'
  },
  'dashboard.stats.overdueBooks': {
    en: 'Overdue Books',
    ru: 'Просроченные книги'
  },
  'dashboard.stats.activeReaders': {
    en: 'Active Readers',
    ru: 'Активных читателей'
  },
  'dashboard.activity.title': {
    en: 'Recent Activity',
    ru: 'Последняя активность'
  },
  'dashboard.recentActivity': {
    en: 'Recent Activity',
    ru: 'Последняя активность'
  },
  'dashboard.popular.title': {
    en: 'Popular Books',
    ru: 'Популярные книги'
  },
  'dashboard.topBorrowedBooks': {
    en: 'Most Borrowed Books',
    ru: 'Самые популярные книги'
  },
  'dashboard.borrowingSummary': {
    en: 'Borrowing Summary',
    ru: 'Сводка по выдачам'
  },
  'dashboard.manageAllBorrows': {
    en: 'Manage All Borrowings',
    ru: 'Управление всеми выдачами'
  },
  'dashboard.borrows': {
    en: 'Borrows',
    ru: 'Выдачи'
  },
  'dashboard.yourBooks': {
    en: 'Your Borrowed Books',
    ru: 'Взятые вами книги'
  },
  'dashboard.viewAllBorrows': {
    en: 'View All Borrowings',
    ru: 'Просмотр всех выдач'
  },
  'dashboard.recentBooks': {
    en: 'Recent Books',
    ru: 'Недавние книги'
  },
  'dashboard.viewAll': {
    en: 'View All',
    ru: 'Просмотреть все'
  },
  'dashboard.overdue.title': {
    en: 'Overdue Books',
    ru: 'Просроченные книги'
  },
  
  // Book management
  'books.title': {
    en: 'Book Collection',
    ru: 'Коллекция книг'
  },
  'books.browse_public': {
    en: 'Browse Books',
    ru: 'Просмотр книг'
  },
  'books.filters': {
    en: 'Filters',
    ru: 'Фильтры'
  },
  'books.filter_description': {
    en: 'Filter books by genre',
    ru: 'Фильтровать книги по жанру'
  },
  'books.select_genre': {
    en: 'Select Genre',
    ru: 'Выберите жанр'
  },
  'books.clear_filters': {
    en: 'Clear Filters',
    ru: 'Сбросить фильтры'
  },
  'books.add': {
    en: 'Add Book',
    ru: 'Добавить книгу'
  },
  'books.search': {
    en: 'Search books',
    ru: 'Поиск книг'
  },
  'books.searchButton': {
    en: 'Search',
    ru: 'Искать'
  },
  'books.book': {
    en: 'Book',
    ru: 'Книга'
  },
  'books.author': {
    en: 'Author',
    ru: 'Автор'
  },
  'books.genre': {
    en: 'Genre',
    ru: 'Жанр'
  },
  'books.year': {
    en: 'Year',
    ru: 'Год'
  },
  'books.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'books.table.title': {
    en: 'Title',
    ru: 'Название'
  },
  'books.table.author': {
    en: 'Author',
    ru: 'Автор'
  },
  'books.table.genre': {
    en: 'Genre',
    ru: 'Жанр'
  },
  'books.table.year': {
    en: 'Year',
    ru: 'Год'
  },
  'books.table.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'books.table.actions': {
    en: 'Actions',
    ru: 'Действия'
  },
  'books.status.available': {
    en: 'Available',
    ru: 'Доступна'
  },
  'books.status.borrowed': {
    en: 'Borrowed',
    ru: 'Выдана'
  },
  'books.status.reserved': {
    en: 'Reserved',
    ru: 'Зарезервирована'
  },
  'books.edit': {
    en: 'Edit',
    ru: 'Редактировать'
  },
  'books.delete': {
    en: 'Delete',
    ru: 'Удалить'
  },
  'books.form.title': {
    en: 'Book Title',
    ru: 'Название книги'
  },
  'books.form.title.placeholder': {
    en: 'Enter book title',
    ru: 'Введите название книги'
  },
  'books.form.author': {
    en: 'Author',
    ru: 'Автор'
  },
  'books.form.author.placeholder': {
    en: 'Enter author name',
    ru: 'Введите имя автора'
  },
  'books.form.genre': {
    en: 'Genre',
    ru: 'Жанр'
  },
  'books.form.genre.placeholder': {
    en: 'Enter book genre',
    ru: 'Введите жанр книги'
  },
  'books.form.year': {
    en: 'Publication Year',
    ru: 'Год издания'
  },
  'books.form.year.placeholder': {
    en: 'Enter publication year',
    ru: 'Введите год издания'
  },
  'books.form.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'books.form.submit': {
    en: 'Save Book',
    ru: 'Сохранить книгу'
  },
  'books.form.cancel': {
    en: 'Cancel',
    ru: 'Отмена'
  },
  'books.form.description': {
    en: 'Enter the details of the book you want to add to your library.',
    ru: 'Введите данные книги, которую вы хотите добавить в библиотеку.'
  },
  'books.form.edit_description': {
    en: 'Update the details of this book.',
    ru: 'Обновите данные этой книги.'
  },
  
  // Borrowing
  'borrowing.title': {
    en: 'Book Borrowing',
    ru: 'Выдача книг'
  },
  'borrowing.borrowDate': {
    en: 'Borrowed Date',
    ru: 'Дата выдачи'
  },
  'borrowing.dueDate': {
    en: 'Due Date',
    ru: 'Дата возврата'
  },
  'borrowing.returnBook': {
    en: 'Return Book',
    ru: 'Вернуть книгу'
  },
  'borrowing.borrowButton': {
    en: 'Borrow a Book',
    ru: 'Выдать книгу'
  },
  'borrowing.borrowingList': {
    en: 'Borrowing List',
    ru: 'Список выдач'
  },
  'borrowing.active': {
    en: 'Active',
    ru: 'Активные'
  },
  'borrowing.returned': {
    en: 'Returned',
    ru: 'Возвращенные'
  },
  'borrowing.overdue': {
    en: 'Overdue',
    ru: 'Просроченные'
  },
  'borrowing.noBorrows': {
    en: 'No borrowed books',
    ru: 'Нет выданных книг'
  },
  'borrowing.noBorrowsDescription': {
    en: 'You don\'t have any active borrowings. Borrow a book to get started.',
    ru: 'У вас нет активных выдач. Выдайте книгу, чтобы начать.'
  },
  'borrowing.borrowDialogTitle': {
    en: 'Borrow a Book',
    ru: 'Выдать книгу'
  },
  'borrowing.borrowDialogDescription': {
    en: 'Select a book and set the due date for return.',
    ru: 'Выберите книгу и установите дату возврата.'
  },
  'borrowing.selectBook': {
    en: 'Select a book',
    ru: 'Выберите книгу'
  },
  'borrowing.selectDueDate': {
    en: 'Select a due date',
    ru: 'Выберите дату возврата'
  },
  'borrowing.confirmBorrow': {
    en: 'Borrow Book',
    ru: 'Выдать книгу'
  },
  'borrowing.noAvailableBooks': {
    en: 'No available books',
    ru: 'Нет доступных книг'
  },
  'borrowing.noRecordsInFilter': {
    en: 'No records in this filter',
    ru: 'Нет записей в этом фильтре'
  },
  'borrowing.returnedOn': {
    en: 'Returned on',
    ru: 'Возвращена'
  },
  'borrowing.borrower': {
    en: 'Borrower',
    ru: 'Читатель'
  },
  'borrowing.oneWeek': {
    en: '1 Week',
    ru: '1 неделя'
  },
  'borrowing.twoWeeks': {
    en: '2 Weeks',
    ru: '2 недели'
  },
  'borrowing.oneMonth': {
    en: '1 Month',
    ru: '1 месяц'
  },
  'borrowing.successBorrow': {
    en: 'Book borrowed',
    ru: 'Книга выдана'
  },
  'borrowing.successBorrowDescription': {
    en: 'The book has been successfully borrowed',
    ru: 'Книга была успешно выдана'
  },
  'borrowing.failedBorrow': {
    en: 'Failed to borrow book',
    ru: 'Не удалось выдать книгу'
  },
  'borrowing.successReturn': {
    en: 'Book returned',
    ru: 'Книга возвращена'
  },
  'borrowing.successReturnDescription': {
    en: 'The book has been successfully returned',
    ru: 'Книга была успешно возвращена'
  },
  'borrowing.failedReturn': {
    en: 'Failed to return book',
    ru: 'Не удалось вернуть книгу'
  },
  'borrowing.form.title': {
    en: 'Borrow a Book',
    ru: 'Выдать книгу'
  },
  'borrowing.form.user': {
    en: 'Select User',
    ru: 'Выбрать пользователя'
  },
  'borrowing.form.book': {
    en: 'Select Book',
    ru: 'Выбрать книгу'
  },
  'borrowing.form.date': {
    en: 'Borrow Date',
    ru: 'Дата выдачи'
  },
  'borrowing.form.due': {
    en: 'Due Date',
    ru: 'Дата возврата'
  },
  'borrowing.form.submit': {
    en: 'Borrow Book',
    ru: 'Выдать книгу'
  },
  'borrowing.list.title': {
    en: 'Current Borrowings',
    ru: 'Текущие выдачи'
  },
  'borrowing.list.user': {
    en: 'User',
    ru: 'Пользователь'
  },
  'borrowing.list.book': {
    en: 'Book',
    ru: 'Книга'
  },
  'borrowing.list.borrowed': {
    en: 'Borrowed Date',
    ru: 'Дата выдачи'
  },
  'borrowing.list.due': {
    en: 'Due Date',
    ru: 'Дата возврата'
  },
  'borrowing.list.returned': {
    en: 'Returned Date',
    ru: 'Дата возвращения'
  },
  'borrowing.list.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'borrowing.list.actions': {
    en: 'Actions',
    ru: 'Действия'
  },
  'borrowing.return': {
    en: 'Return Book',
    ru: 'Вернуть книгу'
  },
  'borrowing.status.borrowed': {
    en: 'Borrowed',
    ru: 'Выдана'
  },
  'borrowing.status.returned': {
    en: 'Returned',
    ru: 'Возвращена'
  },
  'borrowing.status.overdue': {
    en: 'Overdue',
    ru: 'Просрочена'
  },
  
  // Common
  'loading': {
    en: 'Loading...',
    ru: 'Загрузка...'
  },
  'errors.unknown': {
    en: 'An unknown error occurred',
    ru: 'Произошла неизвестная ошибка'
  },
  'common.actions': {
    en: 'Actions',
    ru: 'Действия'
  },
  'common.close': {
    en: 'Close',
    ru: 'Закрыть'
  },
  'common.accessDenied': {
    en: 'Access Denied',
    ru: 'Доступ запрещен'
  },
  'common.accessDeniedMessage': {
    en: 'Sorry, you don\'t have permission to access this page. This page is restricted to',
    ru: 'К сожалению, у вас нет доступа к этой странице. Страница доступна только для'
  },
  'common.backToDashboard': {
    en: 'Go back to dashboard',
    ru: 'Вернуться на главную'
  },
  
  // Users
  'users.title': {
    en: 'User Management',
    ru: 'Управление пользователями'
  },
  'users.table.name': {
    en: 'Name',
    ru: 'Имя'
  },
  'users.table.username': {
    en: 'Username',
    ru: 'Имя пользователя'
  },
  'users.table.email': {
    en: 'Email',
    ru: 'Электронная почта'
  },
  'users.table.role': {
    en: 'Role',
    ru: 'Роль'
  },
  'users.table.actions': {
    en: 'Actions',
    ru: 'Действия'
  },
  'users.table.status': {
    en: 'Status',
    ru: 'Статус'
  },
  'users.block': {
    en: 'Block',
    ru: 'Заблокировать'
  },
  'users.unblock': {
    en: 'Unblock',
    ru: 'Разблокировать'
  },
  'users.status.active': {
    en: 'Active',
    ru: 'Активен'
  },
  'users.status.blocked': {
    en: 'Blocked',
    ru: 'Заблокирован'
  },
  'users.status.updated': {
    en: 'User status updated',
    ru: 'Статус пользователя обновлен'
  },
  
  // Activity
  'activity.book_added': {
    en: 'added a new book',
    ru: 'добавил(а) новую книгу'
  },
  'activity.book_updated': {
    en: 'updated book',
    ru: 'обновил(а) книгу'
  },
  'activity.book_deleted': {
    en: 'deleted book',
    ru: 'удалил(а) книгу'
  },
  'activity.book_borrowed': {
    en: 'borrowed book',
    ru: 'взял(а) книгу'
  },
  'activity.book_returned': {
    en: 'returned book',
    ru: 'вернул(а) книгу'
  },
  'activity.user_created': {
    en: 'registered as a new user',
    ru: 'зарегистрировался(ась) как новый пользователь'
  },
  
  // Settings
  'settings.title': {
    en: 'Settings',
    ru: 'Настройки'
  },
  'settings.language': {
    en: 'Language',
    ru: 'Язык'
  },
  'settings.language.en': {
    en: 'English',
    ru: 'Английский'
  },
  'settings.language.ru': {
    en: 'Russian',
    ru: 'Русский'
  },
  'settings.theme': {
    en: 'Theme',
    ru: 'Тема'
  },
  'settings.theme.light': {
    en: 'Light',
    ru: 'Светлая'
  },
  'settings.theme.dark': {
    en: 'Dark',
    ru: 'Темная'
  },
  'settings.theme.system': {
    en: 'System',
    ru: 'Системная'
  },
  'settings.save': {
    en: 'Save Settings',
    ru: 'Сохранить настройки'
  },
  
  // Errors and notifications
  'error.login': {
    en: 'Login failed. Please check your credentials.',
    ru: 'Ошибка входа. Пожалуйста, проверьте ваши данные.'
  },
  'error.register': {
    en: 'Registration failed. Please try again.',
    ru: 'Ошибка регистрации. Пожалуйста, попробуйте снова.'
  },
  'error.username.exists': {
    en: 'Username already exists.',
    ru: 'Имя пользователя уже существует.'
  },
  'error.email.exists': {
    en: 'Email already in use.',
    ru: 'Электронная почта уже используется.'
  },
  'error.required': {
    en: 'This field is required.',
    ru: 'Это поле обязательно для заполнения.'
  },
  'error.email.invalid': {
    en: 'Please enter a valid email address.',
    ru: 'Пожалуйста, введите корректный адрес электронной почты.'
  },
  'notification.login.success': {
    en: 'Login successful!',
    ru: 'Вход выполнен успешно!'
  },
  'notification.register.success': {
    en: 'Registration successful! You can now login.',
    ru: 'Регистрация выполнена успешно! Теперь вы можете войти.'
  },
  'notification.logout.success': {
    en: 'Logged out successfully!',
    ru: 'Выход выполнен успешно!'
  },
  'notification.book.added': {
    en: 'Book added successfully!',
    ru: 'Книга добавлена успешно!'
  },
  'notification.book.updated': {
    en: 'Book updated successfully!',
    ru: 'Книга обновлена успешно!'
  },
  'notification.book.deleted': {
    en: 'Book deleted successfully!',
    ru: 'Книга удалена успешно!'
  },
  'books.toast.added': {
    en: 'The book has been added to your library',
    ru: 'Книга была добавлена в вашу библиотеку'
  },
  'books.toast.add_error': {
    en: 'Failed to add book',
    ru: 'Не удалось добавить книгу'
  },
  'books.toast.updated': {
    en: 'The book has been updated successfully',
    ru: 'Книга была успешно обновлена'
  },
  'books.toast.update_error': {
    en: 'Failed to update book',
    ru: 'Не удалось обновить книгу'
  },
  'books.toast.deleted': {
    en: 'The book has been removed from your library',
    ru: 'Книга была удалена из вашей библиотеки'
  },
  'books.toast.delete_error': {
    en: 'Failed to delete book',
    ru: 'Не удалось удалить книгу'
  },
  'books.empty.title': {
    en: 'No books found',
    ru: 'Книги не найдены'
  },
  'books.empty.search': {
    en: 'No books match your search criteria. Try a different search.',
    ru: 'Нет книг, соответствующих вашему запросу. Попробуйте другой поиск.'
  },
  'books.empty.library': {
    en: 'Your library is empty. Add some books to get started.',
    ru: 'Ваша библиотека пуста. Добавьте книги, чтобы начать работу.'
  },
  'books.add_first': {
    en: 'Add Your First Book',
    ru: 'Добавить вашу первую книгу'
  },
  'books.delete.confirm': {
    en: 'Are you sure?',
    ru: 'Вы уверены?'
  },
  'books.delete.message': {
    en: 'This will permanently delete',
    ru: 'Это навсегда удалит'
  },
  'books.delete.from_library': {
    en: 'from your library. This action cannot be undone.',
    ru: 'из вашей библиотеки. Это действие нельзя отменить.'
  },
  'books.delete.in_progress': {
    en: 'Deleting...',
    ru: 'Удаление...'
  },
  
  // 3D Book Viewer
  'book_viewer.title': {
    en: '3D Book Preview',
    ru: '3D просмотр книги'
  },
  'book_viewer.loading': {
    en: 'Loading 3D preview...',
    ru: 'Загрузка 3D предпросмотра...'
  },
  'book_viewer.reset': {
    en: 'Reset',
    ru: 'Сбросить'
  },
  'book_viewer.reset_rotation': {
    en: 'Reset book rotation',
    ru: 'Сбросить вращение книги'
  },
  'book_viewer.auto_rotate': {
    en: 'Auto-rotate',
    ru: 'Авто-вращение'
  },
  'book_viewer.stop_rotation': {
    en: 'Stop rotation',
    ru: 'Остановить вращение'
  },
  'book_viewer.rotate_instruction': {
    en: 'Click and drag to rotate the book',
    ru: 'Нажмите и перетащите, чтобы вращать книгу'
  },
  'book_viewer.view': {
    en: 'View in 3D',
    ru: 'Просмотр в 3D'
  },

  // Library Info
  'library_info_subtitle': {
    en: 'Contact information and working hours',
    ru: 'Контактная информация и часы работы'
  },
  'library_info_address': {
    en: 'Address',
    ru: 'Адрес'
  },
  'library_info_phone': {
    en: 'Phone',
    ru: 'Телефон'
  },
  'library_info_email': {
    en: 'Email',
    ru: 'Электронная почта'
  },
  'library_info_open_hours': {
    en: 'Opening Hours',
    ru: 'Часы работы'
  },
  'library_info_description': {
    en: 'About Us',
    ru: 'О нас'
  },
  'library_info_last_updated': {
    en: 'Information last updated',
    ru: 'Информация обновлена'
  },
  'library_info_edit_button': {
    en: 'Edit Information',
    ru: 'Редактировать информацию'
  },
  'library_info_add_button': {
    en: 'Add Library Information',
    ru: 'Добавить информацию о библиотеке'
  },
  'library_info_edit_dialog_title': {
    en: 'Edit Library Information',
    ru: 'Редактирование информации о библиотеке'
  },
  'library_info_edit_dialog_description': {
    en: 'Update the contact information and details about your library',
    ru: 'Обновите контактную информацию и данные о вашей библиотеке'
  },
  'library_info_form_name': {
    en: 'Library Name',
    ru: 'Название библиотеки'
  },
  'library_info_form_name_placeholder': {
    en: 'Enter library name',
    ru: 'Введите название библиотеки'
  },
  'library_info_form_address': {
    en: 'Address',
    ru: 'Адрес'
  },
  'library_info_form_address_placeholder': {
    en: 'Enter full address',
    ru: 'Введите полный адрес'
  },
  'library_info_form_phone': {
    en: 'Phone Number',
    ru: 'Номер телефона'
  },
  'library_info_form_email': {
    en: 'Email Address',
    ru: 'Адрес электронной почты'
  },
  'library_info_form_open_hours': {
    en: 'Opening Hours',
    ru: 'Часы работы'
  },
  'library_info_form_open_hours_placeholder': {
    en: 'E.g., Mon-Fri: 9:00-18:00, Sat: 10:00-15:00',
    ru: 'Например, Пн-Пт: 9:00-18:00, Сб: 10:00-15:00'
  },
  'library_info_form_description': {
    en: 'Description',
    ru: 'Описание'
  },
  'library_info_form_description_placeholder': {
    en: 'Briefly describe your library',
    ru: 'Кратко опишите вашу библиотеку'
  },
  'library_info_form_logo_url': {
    en: 'Logo URL',
    ru: 'URL логотипа'
  },
  'library_info_form_logo_url_placeholder': {
    en: 'Enter URL to your library logo',
    ru: 'Введите URL к логотипу библиотеки'
  },
  'library_info_form_logo_url_description': {
    en: 'Optional: URL to your library logo image',
    ru: 'Опционально: URL к изображению логотипа библиотеки'
  },
  'library_info_form_submit': {
    en: 'Save Information',
    ru: 'Сохранить информацию'
  },
  'library_info_form_submitting': {
    en: 'Saving...',
    ru: 'Сохранение...'
  },
  'library_info_not_found_title': {
    en: 'Library Information Not Available',
    ru: 'Информация о библиотеке отсутствует'
  },
  'library_info_not_found_description': {
    en: 'Contact and working hours information has not been set up yet',
    ru: 'Контактная информация и часы работы еще не настроены'
  },
  'library_info_updated_success_title': {
    en: 'Success!',
    ru: 'Успешно!'
  },
  'library_info_updated_success_description': {
    en: 'Library information has been updated successfully',
    ru: 'Информация о библиотеке успешно обновлена'
  },
  'library_info_update_error_title': {
    en: 'Update Failed',
    ru: 'Ошибка обновления'
  },
  'library_info_update_error_description': {
    en: 'Failed to update library information. Please try again.',
    ru: 'Не удалось обновить информацию о библиотеке. Пожалуйста, повторите попытку.'
  },
  'activity.library_info_updated': {
    en: 'updated library information',
    ru: 'обновил(а) информацию о библиотеке'
  }
};

// Language context hooks
// Will be used in another file