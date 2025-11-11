/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./contexts/AuthContext.js":
/*!*********************************!*\
  !*** ./contexts/AuthContext.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _hooks_useLocalStorage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/useLocalStorage */ \"./hooks/useLocalStorage.js\");\n// contexts/AuthContext.js\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction AuthProvider({ children }) {\n    const [user, setUser] = (0,_hooks_useLocalStorage__WEBPACK_IMPORTED_MODULE_3__.useLocalStorage)(\"user\", null);\n    const [token, setToken] = (0,_hooks_useLocalStorage__WEBPACK_IMPORTED_MODULE_3__.useLocalStorage)(\"token\", null);\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Verifica se o usuário está autenticado apenas uma vez no carregamento inicial\n        const checkAuth = ()=>{\n            if (user && token) {\n                // Usuário está autenticado\n                if (router.pathname === \"/login\") {\n                    router.push(\"/\");\n                }\n            } else {\n                // Usuário não está autenticado\n                if (router.pathname !== \"/login\") {\n                    router.push(\"/login\");\n                }\n            }\n            setLoading(false);\n        };\n        checkAuth();\n    }, []) // Removemos as dependências para executar apenas uma vez\n    ;\n    const login = async (userData, userToken)=>{\n        setUser(userData);\n        setToken(userToken);\n        router.push(\"/\") // Redireciona para a home após login\n        ;\n    };\n    const logout = ()=>{\n        setUser(null);\n        setToken(null);\n        localStorage.removeItem(\"user\");\n        localStorage.removeItem(\"token\");\n        router.push(\"/login\");\n    };\n    const value = {\n        user,\n        token,\n        login,\n        logout,\n        isAuthenticated: !!user && !!token,\n        loading\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: value,\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\G-VD02\\\\OneDrive\\\\Imagens\\\\p-doces-delicados\\\\contexts\\\\AuthContext.js\",\n        lineNumber: 58,\n        columnNumber: 5\n    }, this);\n}\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (!context) {\n        throw new Error(\"useAuth must be used within an AuthProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZXh0cy9BdXRoQ29udGV4dC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwwQkFBMEI7O0FBQzRDO0FBQy9CO0FBQ21CO0FBRTFELE1BQU1NLDRCQUFjTixvREFBYUE7QUFFMUIsU0FBU08sYUFBYSxFQUFFQyxRQUFRLEVBQUU7SUFDdkMsTUFBTSxDQUFDQyxNQUFNQyxRQUFRLEdBQUdMLHVFQUFlQSxDQUFDLFFBQVE7SUFDaEQsTUFBTSxDQUFDTSxPQUFPQyxTQUFTLEdBQUdQLHVFQUFlQSxDQUFDLFNBQVM7SUFDbkQsTUFBTSxDQUFDUSxTQUFTQyxXQUFXLEdBQUdYLCtDQUFRQSxDQUFDO0lBQ3ZDLE1BQU1ZLFNBQVNYLHNEQUFTQTtJQUV4QkYsZ0RBQVNBLENBQUM7UUFDUixnRkFBZ0Y7UUFDaEYsTUFBTWMsWUFBWTtZQUNoQixJQUFJUCxRQUFRRSxPQUFPO2dCQUNqQiwyQkFBMkI7Z0JBQzNCLElBQUlJLE9BQU9FLFFBQVEsS0FBSyxVQUFVO29CQUNoQ0YsT0FBT0csSUFBSSxDQUFDO2dCQUNkO1lBQ0YsT0FBTztnQkFDTCwrQkFBK0I7Z0JBQy9CLElBQUlILE9BQU9FLFFBQVEsS0FBSyxVQUFVO29CQUNoQ0YsT0FBT0csSUFBSSxDQUFDO2dCQUNkO1lBQ0Y7WUFDQUosV0FBVztRQUNiO1FBRUFFO0lBQ0YsR0FBRyxFQUFFLEVBQUUseURBQXlEOztJQUVoRSxNQUFNRyxRQUFRLE9BQU9DLFVBQVVDO1FBQzdCWCxRQUFRVTtRQUNSUixTQUFTUztRQUNUTixPQUFPRyxJQUFJLENBQUMsS0FBSyxxQ0FBcUM7O0lBQ3hEO0lBRUEsTUFBTUksU0FBUztRQUNiWixRQUFRO1FBQ1JFLFNBQVM7UUFDVFcsYUFBYUMsVUFBVSxDQUFDO1FBQ3hCRCxhQUFhQyxVQUFVLENBQUM7UUFDeEJULE9BQU9HLElBQUksQ0FBQztJQUNkO0lBRUEsTUFBTU8sUUFBUTtRQUNaaEI7UUFDQUU7UUFDQVE7UUFDQUc7UUFDQUksaUJBQWlCLENBQUMsQ0FBQ2pCLFFBQVEsQ0FBQyxDQUFDRTtRQUM3QkU7SUFDRjtJQUVBLHFCQUNFLDhEQUFDUCxZQUFZcUIsUUFBUTtRQUFDRixPQUFPQTtrQkFDMUJqQjs7Ozs7O0FBR1A7QUFFTyxNQUFNb0IsVUFBVTtJQUNyQixNQUFNQyxVQUFVNUIsaURBQVVBLENBQUNLO0lBQzNCLElBQUksQ0FBQ3VCLFNBQVM7UUFDWixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFDQSxPQUFPRDtBQUNULEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kb2Npbmhvcy1hcHAvLi9jb250ZXh0cy9BdXRoQ29udGV4dC5qcz81OWNlIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbnRleHRzL0F1dGhDb250ZXh0LmpzXHJcbmltcG9ydCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcclxuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInXHJcbmltcG9ydCB7IHVzZUxvY2FsU3RvcmFnZSB9IGZyb20gJy4uL2hvb2tzL3VzZUxvY2FsU3RvcmFnZSdcclxuXHJcbmNvbnN0IEF1dGhDb250ZXh0ID0gY3JlYXRlQ29udGV4dCgpXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gQXV0aFByb3ZpZGVyKHsgY2hpbGRyZW4gfSkge1xyXG4gIGNvbnN0IFt1c2VyLCBzZXRVc2VyXSA9IHVzZUxvY2FsU3RvcmFnZSgndXNlcicsIG51bGwpXHJcbiAgY29uc3QgW3Rva2VuLCBzZXRUb2tlbl0gPSB1c2VMb2NhbFN0b3JhZ2UoJ3Rva2VuJywgbnVsbClcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyBWZXJpZmljYSBzZSBvIHVzdcOhcmlvIGVzdMOhIGF1dGVudGljYWRvIGFwZW5hcyB1bWEgdmV6IG5vIGNhcnJlZ2FtZW50byBpbmljaWFsXHJcbiAgICBjb25zdCBjaGVja0F1dGggPSAoKSA9PiB7XHJcbiAgICAgIGlmICh1c2VyICYmIHRva2VuKSB7XHJcbiAgICAgICAgLy8gVXN1w6FyaW8gZXN0w6EgYXV0ZW50aWNhZG9cclxuICAgICAgICBpZiAocm91dGVyLnBhdGhuYW1lID09PSAnL2xvZ2luJykge1xyXG4gICAgICAgICAgcm91dGVyLnB1c2goJy8nKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBVc3XDoXJpbyBuw6NvIGVzdMOhIGF1dGVudGljYWRvXHJcbiAgICAgICAgaWYgKHJvdXRlci5wYXRobmFtZSAhPT0gJy9sb2dpbicpIHtcclxuICAgICAgICAgIHJvdXRlci5wdXNoKCcvbG9naW4nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrQXV0aCgpXHJcbiAgfSwgW10pIC8vIFJlbW92ZW1vcyBhcyBkZXBlbmTDqm5jaWFzIHBhcmEgZXhlY3V0YXIgYXBlbmFzIHVtYSB2ZXpcclxuXHJcbiAgY29uc3QgbG9naW4gPSBhc3luYyAodXNlckRhdGEsIHVzZXJUb2tlbikgPT4ge1xyXG4gICAgc2V0VXNlcih1c2VyRGF0YSlcclxuICAgIHNldFRva2VuKHVzZXJUb2tlbilcclxuICAgIHJvdXRlci5wdXNoKCcvJykgLy8gUmVkaXJlY2lvbmEgcGFyYSBhIGhvbWUgYXDDs3MgbG9naW5cclxuICB9XHJcblxyXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcclxuICAgIHNldFVzZXIobnVsbClcclxuICAgIHNldFRva2VuKG51bGwpXHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpXHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKVxyXG4gICAgcm91dGVyLnB1c2goJy9sb2dpbicpXHJcbiAgfVxyXG5cclxuICBjb25zdCB2YWx1ZSA9IHtcclxuICAgIHVzZXIsXHJcbiAgICB0b2tlbixcclxuICAgIGxvZ2luLFxyXG4gICAgbG9nb3V0LFxyXG4gICAgaXNBdXRoZW50aWNhdGVkOiAhIXVzZXIgJiYgISF0b2tlbixcclxuICAgIGxvYWRpbmdcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8QXV0aENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCB1c2VBdXRoID0gKCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KEF1dGhDb250ZXh0KVxyXG4gIGlmICghY29udGV4dCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VBdXRoIG11c3QgYmUgdXNlZCB3aXRoaW4gYW4gQXV0aFByb3ZpZGVyJylcclxuICB9XHJcbiAgcmV0dXJuIGNvbnRleHRcclxufSJdLCJuYW1lcyI6WyJjcmVhdGVDb250ZXh0IiwidXNlQ29udGV4dCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlUm91dGVyIiwidXNlTG9jYWxTdG9yYWdlIiwiQXV0aENvbnRleHQiLCJBdXRoUHJvdmlkZXIiLCJjaGlsZHJlbiIsInVzZXIiLCJzZXRVc2VyIiwidG9rZW4iLCJzZXRUb2tlbiIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwicm91dGVyIiwiY2hlY2tBdXRoIiwicGF0aG5hbWUiLCJwdXNoIiwibG9naW4iLCJ1c2VyRGF0YSIsInVzZXJUb2tlbiIsImxvZ291dCIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJ2YWx1ZSIsImlzQXV0aGVudGljYXRlZCIsIlByb3ZpZGVyIiwidXNlQXV0aCIsImNvbnRleHQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./contexts/AuthContext.js\n");

/***/ }),

/***/ "./contexts/ThemeContext.js":
/*!**********************************!*\
  !*** ./contexts/ThemeContext.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ThemeProvider: () => (/* binding */ ThemeProvider),\n/* harmony export */   useTheme: () => (/* binding */ useTheme)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _hooks_useLocalStorage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useLocalStorage */ \"./hooks/useLocalStorage.js\");\n// contexts/ThemeContext.js\n\n\n\nconst ThemeContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)();\nfunction ThemeProvider({ children }) {\n    const [theme, setTheme] = (0,_hooks_useLocalStorage__WEBPACK_IMPORTED_MODULE_2__.useLocalStorage)(\"theme\", \"dark\");\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        document.body.className = theme;\n    }, [\n        theme\n    ]);\n    const toggleTheme = ()=>{\n        setTheme(theme === \"dark\" ? \"light\" : \"dark\");\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ThemeContext.Provider, {\n        value: {\n            theme,\n            toggleTheme\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\G-VD02\\\\OneDrive\\\\Imagens\\\\p-doces-delicados\\\\contexts\\\\ThemeContext.js\",\n        lineNumber: 19,\n        columnNumber: 5\n    }, this);\n}\nconst useTheme = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);\n    if (!context) {\n        throw new Error(\"useTheme must be used within a ThemeProvider\");\n    }\n    return context;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb250ZXh0cy9UaGVtZUNvbnRleHQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDJCQUEyQjs7QUFDaUM7QUFDRjtBQUUxRCxNQUFNSSw2QkFBZUosb0RBQWFBO0FBRTNCLFNBQVNLLGNBQWMsRUFBRUMsUUFBUSxFQUFFO0lBQ3hDLE1BQU0sQ0FBQ0MsT0FBT0MsU0FBUyxHQUFHTCx1RUFBZUEsQ0FBQyxTQUFTO0lBRW5ERCxnREFBU0EsQ0FBQztRQUNSTyxTQUFTQyxJQUFJLENBQUNDLFNBQVMsR0FBR0o7SUFDNUIsR0FBRztRQUFDQTtLQUFNO0lBRVYsTUFBTUssY0FBYztRQUNsQkosU0FBU0QsVUFBVSxTQUFTLFVBQVU7SUFDeEM7SUFFQSxxQkFDRSw4REFBQ0gsYUFBYVMsUUFBUTtRQUFDQyxPQUFPO1lBQUVQO1lBQU9LO1FBQVk7a0JBQ2hETjs7Ozs7O0FBR1A7QUFFTyxNQUFNUyxXQUFXO0lBQ3RCLE1BQU1DLFVBQVVmLGlEQUFVQSxDQUFDRztJQUMzQixJQUFJLENBQUNZLFNBQVM7UUFDWixNQUFNLElBQUlDLE1BQU07SUFDbEI7SUFDQSxPQUFPRDtBQUNULEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kb2Npbmhvcy1hcHAvLi9jb250ZXh0cy9UaGVtZUNvbnRleHQuanM/YjczOSJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjb250ZXh0cy9UaGVtZUNvbnRleHQuanNcclxuaW1wb3J0IHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXHJcbmltcG9ydCB7IHVzZUxvY2FsU3RvcmFnZSB9IGZyb20gJy4uL2hvb2tzL3VzZUxvY2FsU3RvcmFnZSdcclxuXHJcbmNvbnN0IFRoZW1lQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQoKVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFRoZW1lUHJvdmlkZXIoeyBjaGlsZHJlbiB9KSB7XHJcbiAgY29uc3QgW3RoZW1lLCBzZXRUaGVtZV0gPSB1c2VMb2NhbFN0b3JhZ2UoJ3RoZW1lJywgJ2RhcmsnKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSB0aGVtZVxyXG4gIH0sIFt0aGVtZV0pXHJcblxyXG4gIGNvbnN0IHRvZ2dsZVRoZW1lID0gKCkgPT4ge1xyXG4gICAgc2V0VGhlbWUodGhlbWUgPT09ICdkYXJrJyA/ICdsaWdodCcgOiAnZGFyaycpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPFRoZW1lQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17eyB0aGVtZSwgdG9nZ2xlVGhlbWUgfX0+XHJcbiAgICAgIHtjaGlsZHJlbn1cclxuICAgIDwvVGhlbWVDb250ZXh0LlByb3ZpZGVyPlxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHVzZVRoZW1lID0gKCkgPT4ge1xyXG4gIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFRoZW1lQ29udGV4dClcclxuICBpZiAoIWNvbnRleHQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlVGhlbWUgbXVzdCBiZSB1c2VkIHdpdGhpbiBhIFRoZW1lUHJvdmlkZXInKVxyXG4gIH1cclxuICByZXR1cm4gY29udGV4dFxyXG59Il0sIm5hbWVzIjpbImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlRWZmZWN0IiwidXNlTG9jYWxTdG9yYWdlIiwiVGhlbWVDb250ZXh0IiwiVGhlbWVQcm92aWRlciIsImNoaWxkcmVuIiwidGhlbWUiLCJzZXRUaGVtZSIsImRvY3VtZW50IiwiYm9keSIsImNsYXNzTmFtZSIsInRvZ2dsZVRoZW1lIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZVRoZW1lIiwiY29udGV4dCIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./contexts/ThemeContext.js\n");

/***/ }),

/***/ "./hooks/useLocalStorage.js":
/*!**********************************!*\
  !*** ./hooks/useLocalStorage.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useLocalStorage: () => (/* binding */ useLocalStorage)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);\n// hooks/useLocalStorage.js\n\nfunction useLocalStorage(key, initialValue) {\n    const [storedValue, setStoredValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(initialValue);\n    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(()=>{\n        try {\n            const item = window.localStorage.getItem(key);\n            if (item) {\n                setStoredValue(JSON.parse(item));\n            }\n        } catch (error) {\n            console.log(`Error reading localStorage key \"${key}\":`, error);\n        }\n    }, [\n        key\n    ]);\n    const setValue = (value)=>{\n        try {\n            const valueToStore = value instanceof Function ? value(storedValue) : value;\n            setStoredValue(valueToStore);\n            window.localStorage.setItem(key, JSON.stringify(valueToStore));\n        } catch (error) {\n            console.log(`Error setting localStorage key \"${key}\":`, error);\n        }\n    };\n    return [\n        storedValue,\n        setValue\n    ];\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9ob29rcy91c2VMb2NhbFN0b3JhZ2UuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkJBQTJCO0FBQ2dCO0FBRXBDLFNBQVNFLGdCQUFnQkMsR0FBRyxFQUFFQyxZQUFZO0lBQy9DLE1BQU0sQ0FBQ0MsYUFBYUMsZUFBZSxHQUFHTiwrQ0FBUUEsQ0FBQ0k7SUFFL0NILGdEQUFTQSxDQUFDO1FBQ1IsSUFBSTtZQUNGLE1BQU1NLE9BQU9DLE9BQU9DLFlBQVksQ0FBQ0MsT0FBTyxDQUFDUDtZQUN6QyxJQUFJSSxNQUFNO2dCQUNSRCxlQUFlSyxLQUFLQyxLQUFLLENBQUNMO1lBQzVCO1FBQ0YsRUFBRSxPQUFPTSxPQUFPO1lBQ2RDLFFBQVFDLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFWixJQUFJLEVBQUUsQ0FBQyxFQUFFVTtRQUMxRDtJQUNGLEdBQUc7UUFBQ1Y7S0FBSTtJQUVSLE1BQU1hLFdBQVcsQ0FBQ0M7UUFDaEIsSUFBSTtZQUNGLE1BQU1DLGVBQWVELGlCQUFpQkUsV0FBV0YsTUFBTVosZUFBZVk7WUFDdEVYLGVBQWVZO1lBQ2ZWLE9BQU9DLFlBQVksQ0FBQ1csT0FBTyxDQUFDakIsS0FBS1EsS0FBS1UsU0FBUyxDQUFDSDtRQUNsRCxFQUFFLE9BQU9MLE9BQU87WUFDZEMsUUFBUUMsR0FBRyxDQUFDLENBQUMsZ0NBQWdDLEVBQUVaLElBQUksRUFBRSxDQUFDLEVBQUVVO1FBQzFEO0lBQ0Y7SUFFQSxPQUFPO1FBQUNSO1FBQWFXO0tBQVM7QUFDaEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9kb2Npbmhvcy1hcHAvLi9ob29rcy91c2VMb2NhbFN0b3JhZ2UuanM/MzNkYSJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBob29rcy91c2VMb2NhbFN0b3JhZ2UuanNcclxuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHVzZUxvY2FsU3RvcmFnZShrZXksIGluaXRpYWxWYWx1ZSkge1xyXG4gIGNvbnN0IFtzdG9yZWRWYWx1ZSwgc2V0U3RvcmVkVmFsdWVdID0gdXNlU3RhdGUoaW5pdGlhbFZhbHVlKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgaXRlbSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpXHJcbiAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgc2V0U3RvcmVkVmFsdWUoSlNPTi5wYXJzZShpdGVtKSlcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5sb2coYEVycm9yIHJlYWRpbmcgbG9jYWxTdG9yYWdlIGtleSBcIiR7a2V5fVwiOmAsIGVycm9yKVxyXG4gICAgfVxyXG4gIH0sIFtrZXldKVxyXG5cclxuICBjb25zdCBzZXRWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdmFsdWVUb1N0b3JlID0gdmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbiA/IHZhbHVlKHN0b3JlZFZhbHVlKSA6IHZhbHVlXHJcbiAgICAgIHNldFN0b3JlZFZhbHVlKHZhbHVlVG9TdG9yZSlcclxuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkodmFsdWVUb1N0b3JlKSlcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGBFcnJvciBzZXR0aW5nIGxvY2FsU3RvcmFnZSBrZXkgXCIke2tleX1cIjpgLCBlcnJvcilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBbc3RvcmVkVmFsdWUsIHNldFZhbHVlXVxyXG59Il0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlTG9jYWxTdG9yYWdlIiwia2V5IiwiaW5pdGlhbFZhbHVlIiwic3RvcmVkVmFsdWUiLCJzZXRTdG9yZWRWYWx1ZSIsIml0ZW0iLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwic2V0VmFsdWUiLCJ2YWx1ZSIsInZhbHVlVG9TdG9yZSIsIkZ1bmN0aW9uIiwic2V0SXRlbSIsInN0cmluZ2lmeSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./hooks/useLocalStorage.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _contexts_ThemeContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../contexts/ThemeContext */ \"./contexts/ThemeContext.js\");\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../contexts/AuthContext */ \"./contexts/AuthContext.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);\n// pages/_app.js\n\n\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    // Garante que o tema seja aplicado no carregamento inicial\n    (0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)(()=>{\n        // Forçar o tema escuro inicialmente e depois aplicar o salvo\n        document.body.className = \"dark\";\n        const savedTheme = localStorage.getItem(\"theme\") || \"dark\";\n        setTimeout(()=>{\n            document.body.className = savedTheme;\n        }, 100);\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_ThemeContext__WEBPACK_IMPORTED_MODULE_2__.ThemeProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_3__.AuthProvider, {\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\G-VD02\\\\OneDrive\\\\Imagens\\\\p-doces-delicados\\\\pages\\\\_app.js\",\n                lineNumber: 22,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\G-VD02\\\\OneDrive\\\\Imagens\\\\p-doces-delicados\\\\pages\\\\_app.js\",\n            lineNumber: 21,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\G-VD02\\\\OneDrive\\\\Imagens\\\\p-doces-delicados\\\\pages\\\\_app.js\",\n        lineNumber: 20,\n        columnNumber: 5\n    }, this);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGdCQUFnQjs7QUFDYztBQUMwQjtBQUNGO0FBQ3JCO0FBRWpDLFNBQVNHLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDckMsMkRBQTJEO0lBQzNESCxnREFBU0EsQ0FBQztRQUNSLDZEQUE2RDtRQUM3REksU0FBU0MsSUFBSSxDQUFDQyxTQUFTLEdBQUc7UUFFMUIsTUFBTUMsYUFBYUMsYUFBYUMsT0FBTyxDQUFDLFlBQVk7UUFDcERDLFdBQVc7WUFDVE4sU0FBU0MsSUFBSSxDQUFDQyxTQUFTLEdBQUdDO1FBQzVCLEdBQUc7SUFDTCxHQUFHLEVBQUU7SUFFTCxxQkFDRSw4REFBQ1QsaUVBQWFBO2tCQUNaLDRFQUFDQywrREFBWUE7c0JBQ1gsNEVBQUNHO2dCQUFXLEdBQUdDLFNBQVM7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJaEM7QUFFQSxpRUFBZUYsS0FBS0EsRUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2RvY2luaG9zLWFwcC8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwYWdlcy9fYXBwLmpzXHJcbmltcG9ydCAnLi4vc3R5bGVzL2dsb2JhbHMuY3NzJ1xyXG5pbXBvcnQgeyBUaGVtZVByb3ZpZGVyIH0gZnJvbSAnLi4vY29udGV4dHMvVGhlbWVDb250ZXh0J1xyXG5pbXBvcnQgeyBBdXRoUHJvdmlkZXIgfSBmcm9tICcuLi9jb250ZXh0cy9BdXRoQ29udGV4dCdcclxuaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXHJcblxyXG5mdW5jdGlvbiBNeUFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH0pIHtcclxuICAvLyBHYXJhbnRlIHF1ZSBvIHRlbWEgc2VqYSBhcGxpY2FkbyBubyBjYXJyZWdhbWVudG8gaW5pY2lhbFxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyBGb3LDp2FyIG8gdGVtYSBlc2N1cm8gaW5pY2lhbG1lbnRlIGUgZGVwb2lzIGFwbGljYXIgbyBzYWx2b1xyXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnZGFyaydcclxuICAgIFxyXG4gICAgY29uc3Qgc2F2ZWRUaGVtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aGVtZScpIHx8ICdkYXJrJ1xyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gc2F2ZWRUaGVtZVxyXG4gICAgfSwgMTAwKVxyXG4gIH0sIFtdKVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPFRoZW1lUHJvdmlkZXI+XHJcbiAgICAgIDxBdXRoUHJvdmlkZXI+XHJcbiAgICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgICA8L0F1dGhQcm92aWRlcj5cclxuICAgIDwvVGhlbWVQcm92aWRlcj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15QXBwIl0sIm5hbWVzIjpbIlRoZW1lUHJvdmlkZXIiLCJBdXRoUHJvdmlkZXIiLCJ1c2VFZmZlY3QiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyIsImRvY3VtZW50IiwiYm9keSIsImNsYXNzTmFtZSIsInNhdmVkVGhlbWUiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic2V0VGltZW91dCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();