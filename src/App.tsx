import { PropsWithChildren, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Jumbotron from 'react-bootstrap/Jumbotron';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';
import { Form } from 'react-bootstrap';

type NoProps = {}

const ExampleToast = ({ children } : PropsWithChildren<NoProps>) => {
  const [show, toggleShow] = useState(true);

  return (
    <>
      {!show && <Button onClick={() => toggleShow(true)}>Show Toast</Button>}
      <Toast show={show} onClose={() => toggleShow(false)}>
        <Toast.Header>
          <strong className="mr-auto">React-Bootstrap</strong>
        </Toast.Header>
        <Toast.Body>{children}</Toast.Body>
      </Toast>
    </>
  );
};


type MyPatternProps = {
  desc: MyPatternDescription
}

type MyPatternDescription = { 
  daysPerWeek: number,
  fracsPerDay: number,
  numWeeks: number,
  pattern: boolean[][]
}

const MyPattern = (props: MyPatternProps) => {

  const { desc } = props;

  return (
    <div> {
      desc.pattern.map((weekPattern, idx) =>
        <>
          <span key={"_sp"+idx}>{idx}</span>
          <WeeklyPattern
            key={idx}            
            daysPerWeek={desc.daysPerWeek}
            fracsPerDay={desc.fracsPerDay}
            weeklyPattern={weekPattern}
          />
        </>
      )}
      
    </div>
  );
}

type WeeklyPatternProps = {
  daysPerWeek: number,
  fracsPerDay: number,  
  weeklyPattern: boolean[]
}
const WeeklyPattern = (props: WeeklyPatternProps) => {
  console.log(props.weeklyPattern);

  const foo: React.ReactNode[] = [];
  
  let idx = 0;
  for (let dayOfWeek = 0; dayOfWeek < props.daysPerWeek; dayOfWeek++) {
    for (let fracOfDay = 0; fracOfDay < props.fracsPerDay; fracOfDay++) {

      foo.push(<Form.Check
        inline
        key={idx}
        checked={props.weeklyPattern[idx]}          
      />);

      idx++;
    }
    foo.push(<>&nbsp;&nbsp;</>)
  }
  
  return (
    <div className="weekly_pattern">
      {foo}      
    </div>
  );


  return (
    <div className="weekly_pattern">       
      { props.weeklyPattern.map((checked, idx) => {
        
        return <Form.Check
          inline
          key={idx}
          checked={checked}          
        />      
      })}      
    </div>
  );
}

const thePattern = {
  daysPerWeek: 7,
  fracsPerDay: 2,
  numWeeks: 2,
  pattern: [
    [
      true, true,
      true, true,
      true, true,
      true, true,
      true, true,
      false, false,
      false, false
    ]
  ]
}

const App = () => (
  <Container className="p-3">
    <Jumbotron>
      <h1 className="header">Welcome To React-Bootstrap</h1>
      <MyPattern
        desc = {thePattern}
      />
      <ExampleToast>
        We now have Toasts
        <span role="img" aria-label="tada">
          🎉
        </span>
      </ExampleToast>
    </Jumbotron>
  </Container>
);

export default App;
