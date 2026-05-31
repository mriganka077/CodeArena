import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import QuestionsPanelPrac from '../../components/QuestionsPanelPrac';
import CodeEditorPrac from '../../components/CodeEditorPrac';
import Header from '../../components/HeaderComplete';
import SoftBackdropNew from "../../components/SoftBackdropNew";


const PracticeSet = () => {
  const { state: navState } = useLocation();
  const domain = navState?.domain || 'General';
  const difficulty = navState?.difficulty || 'medium';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codes, setCodes] = useState({});
  const [outputs, setOutputs] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false); // ← new

  const handleQuestionsLoaded = (qs) => {
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers({});
    setCodes({});
    setOutputs({});
    setIsSubmitted(false);
  };

  const handleSelectAnswer = (index, option) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const handleCodeChange = (index, code) => {
    setCodes((prev) => ({ ...prev, [index]: code }));
  };

  const handleOutputChange = (index, output) => {
    setOutputs((prev) => ({ ...prev, [index]: output }));
  };

  const currentQuestion = questions[currentIndex] || null;

  // Hide editor after submit or when question is MCQ
  const showEditor = currentQuestion?.type === 'CODING' && !isSubmitted;

  return (
    <>
      <SoftBackdropNew />
      <div className="h-screen flex flex-col overflow-hidden relative z-10">
        
        <Header />

        <div
          className="flex-1 overflow-hidden text-white font-['Inter'] antialiased"
          style={{
            display: 'grid',
            gridTemplateColumns: showEditor ? '560px minmax(0,1fr)' : '1fr',
            background: `transparent`,
          }}
        >
          <QuestionsPanelPrac
            domain={domain}
            difficulty={difficulty}
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            onQuestionsLoaded={handleQuestionsLoaded}
            onNavigate={setCurrentIndex}
            onSelectAnswer={handleSelectAnswer}
            codes={codes}
            outputs={outputs}
            onSubmitComplete={() => setIsSubmitted(true)}  // ← new
          />

          {showEditor && (
            <CodeEditorPrac
              currentQuestion={currentQuestion}
              currentIndex={currentIndex}
              code={codes[currentIndex] || currentQuestion?.starterCode || ''}
              output={outputs[currentIndex] || ''}
              onCodeChange={(code) => handleCodeChange(currentIndex, code)}
              onOutputChange={(output) => handleOutputChange(currentIndex, output)}
            />
          )}
        </div>
      </div>
    
    </>
  );
};

export default PracticeSet;