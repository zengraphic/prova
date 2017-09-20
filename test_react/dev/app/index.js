import React from 'react';
import ReactDOM from 'react-dom';


const titles = ['titolo1','titolo2','titolo3','titolo4'];
const titleList = titles.map((title, i ) => <a href={'#'+ title} key={'title_' + i} className="link">{title}</a>);

class Header extends React.Component {
    render (){
       return <div>{titleList}</div>;
    }
}


const app = document.getElementById('prova');

ReactDOM.render(<Header/>, app);