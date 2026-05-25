import axios from "axios";

const JUDGE0_API =
  "http://54.243.229.182:2358";

export const LANGUAGE_IDS = {

  // ======================
  // PYTHON
  // ======================

  python: 71,
  python3: 71,

  // ======================
  // JAVASCRIPT
  // ======================

  javascript: 63,
  js: 63,
  nodejs: 63,

  // ======================
  // C / C++
  // ======================

  c: 50,

  cpp: 54,
  "c++": 54,
  cpp17: 54,

  // ======================
  // JAVA
  // ======================

  java: 62,

  // ======================
  // SQL
  // ======================

  sql: 82,

  // ======================
  // TYPESCRIPT
  // ======================

  typescript: 74,

};

export const submitCode =
  async ({
    source_code,
    language_id,
    stdin = "",
  }) => {

    try {

      const response =
        await axios.post(

          `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,

          {
            source_code,
            language_id,
            stdin,
          },

          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }

        );

      return response.data;

    } catch (error) {

      console.error(
        "Judge0 Error:",
        error.message
      );

      throw error;

    }

  };