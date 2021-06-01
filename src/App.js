import styled from 'styled-components';
import { Home } from './components/Home';

const Container = styled.div`
    width: 100%;
    height: 100%;
`;
const App = () => {
    return (
        <Container>
            <Home />
        </Container>
    );
};

export default App;
