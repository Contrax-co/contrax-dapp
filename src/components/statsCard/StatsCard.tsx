import Card from '../card/Card';
import { StyledBtnText, StyledDesc } from './StatsCard.styles';
import Icon from '../icon/Icon';

export default function StatsCard(props: any) {
  const { cardIcon, cardTitle, cardValue, iconImg } = props;
  return (
    <Card bodyClass="p-2" className="p-1">
      <Icon name={cardIcon} iconImg={iconImg} />{' '}
      <StyledDesc className="ms-2"> {cardTitle} </StyledDesc>{' '}
      <StyledBtnText className="float-end mt-1"> {cardValue} </StyledBtnText>
    </Card>
  );
}
