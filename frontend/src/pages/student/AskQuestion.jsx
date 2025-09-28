import React from 'react';
// TODO: Implement form to ask a new question for a lecture
const AskQuestion = () => {
  return (
    <div>
      <h3>Ask a Question</h3>
      {/* Form to submit a new question */}
      <form>
        <input type="text" placeholder="Question Title" required />
        <textarea placeholder="Describe your question" required></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
export default AskQuestion;
