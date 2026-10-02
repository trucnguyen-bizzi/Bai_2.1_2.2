import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/**
 * ESLint theo "Coding standard" của team (Bizzi JavaScript Coding Standard).
 * Số trong comment là số mục của tài liệu. Phần định dạng (dấu nháy, dấu chấm phẩy,
 * thụt lề, độ dài dòng, dấu phẩy cuối, khoảng trắng...) do Prettier đảm nhiệm,
 * cấu hình trong .prettierrc.json.
 */
export default tseslint.config(
  { ignores: ["node_modules/**", "dist/**", "prisma/migrations/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.mjs"],
    rules: {
      // 2. References
      "prefer-const": "error", // 2.1
      "no-var": "error", // 2.2
      "no-const-assign": "error", // 2.1

      // 3. Objects
      "no-new-object": "error", // 3.1
      "object-shorthand": ["error", "always"], // 3.3, 3.4
      "quote-props": ["error", "as-needed"], // 3.6
      "no-prototype-builtins": "error", // 3.7
      "prefer-object-spread": "error", // 3.8

      // 4. Arrays
      "array-callback-return": "error", // 4.7

      // 5. Destructuring
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: { array: true, object: true },
          AssignmentExpression: { array: false, object: false },
        },
      ], // 5.1, 5.2

      // 6. Strings
      "prefer-template": "error", // 6.3
      "no-eval": "error", // 6.4
      "no-useless-escape": "error", // 6.5

      // 7. Functions
      "no-loop-func": "error", // 7.2
      "prefer-rest-params": "error", // 7.5
      "default-param-last": "error", // 7.8
      "no-new-func": "error", // 7.9
      "no-param-reassign": ["error", { props: true }], // 7.11, 7.12
      "prefer-spread": "error", // 7.13

      // 8. Arrow functions
      "prefer-arrow-callback": "error", // 8.1
      "arrow-body-style": ["error", "as-needed"], // 8.2
      "no-confusing-arrow": "error", // 8.5

      // 9. Classes
      "class-methods-use-this": "error", // 9.7

      // 10. Modules
      "no-duplicate-imports": "error", // 10.4
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportNamespaceSpecifier",
          message: "Không dùng wildcard import (10.2).",
        },
        {
          selector: "ExportNamedDeclaration[source]",
          message: "Không export trực tiếp từ import (10.3).",
        },
        {
          selector: "ExportNamedDeclaration > VariableDeclaration[kind='let']",
          message: "Không export biến có thể thay đổi (10.5).",
        },
        {
          selector: "ForInStatement",
          message: "Không dùng for..in; dùng hàm bậc cao như map/filter/forEach (11.1).",
        },
        {
          selector: "ForOfStatement",
          message: "Không dùng for..of; dùng hàm bậc cao như map/filter/forEach (11.1).",
        },
      ],

      // 12. Properties
      "dot-notation": "error", // 12.1
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "pow", message: "Dùng toán tử ** (12.3)." },
      ],

      // 13. Variables
      "one-var": ["error", "never"], // 13.2
      "no-multi-assign": "error", // 13.5
      "no-plusplus": "error", // 13.6

      // 15. Comparison
      eqeqeq: ["error", "always"], // 15.1
      "no-case-declarations": "error", // 15.5
      "no-nested-ternary": "error", // 15.6
      "no-unneeded-ternary": "error", // 15.7

      // 16. Blocks
      curly: ["error", "multi-line"], // 16.1
      "no-else-return": "error", // 16.3

      // 18. Comments
      "spaced-comment": ["error", "always"], // 18.3

      // 22. Type casting
      radix: "error", // 22.3
      "no-new-wrappers": "error", // 22.2, 22.6

      // 23. Naming
      "id-length": ["error", { min: 2 }], // 23.1
      camelcase: ["error", { properties: "never" }], // 23.2
      "new-cap": "error", // 23.3
      "no-underscore-dangle": "error", // 23.4

      // Bổ sung cho TypeScript (không có trong tài liệu gốc)
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^unused" }],
    },
  },
  // Phải đặt cuối: tắt các rule định dạng xung đột với Prettier
  prettier,
);
