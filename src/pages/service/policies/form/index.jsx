import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useIntl, FormattedMessage } from 'react-intl';
import { Autocomplete, FormControlLabel, Grid, InputLabel, Stack, Switch, TextField } from '@mui/material';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import { getServicePoliciesById } from '../service';
import { getServiceCategoryList } from 'pages/service/service-list/service';

import MainCard from 'components/MainCard';
import PoliciesFormHeader from './policies-form-header';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

// Version validation regex: x.x format (e.g., 1.0, 2.1, 10.5)
const versionRegex = /^\d+\.\d+$/;

const PoliciesForm = () => {
  let { id } = useParams();
  const intl = useIntl();

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: [],
    status: true,
    version: '',
    is_form_touched: false,
    category_list: []
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formError, setFormError] = useState({
    titleErr: '',
    contentErr: '',
    versionErr: ''
  });

  // CHECK FORM ERROR
  useEffect(() => {
    if (form.is_form_touched) {
      let objErr = { titleErr: '', contentErr: '', versionErr: '' };

      if (!form.title) {
        objErr.titleErr = intl.formatMessage({ id: 'title-is-required' });
      }

      // Check if content is empty (only HTML tags without text)
      const contentText = form.content.replace(/<[^>]*>/g, '').trim();
      if (!form.content || !contentText) {
        objErr.contentErr = intl.formatMessage({ id: 'content-is-required' });
      }

      if (!form.version) {
        objErr.versionErr = intl.formatMessage({ id: 'version-is-required' });
      } else if (!versionRegex.test(form.version)) {
        objErr.versionErr = intl.formatMessage({ id: 'version-format-invalid' });
      }

      setFormError(objErr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const getData = async () => {
    const categoryList = await getServiceCategoryList();
    console.log('categoryList', categoryList);
    const assignFormData = {
      title: '',
      content: '',
      category: [],
      status: true,
      version: '',
      is_form_touched: false,
      category_list: categoryList
    };

    if (id) {
      const resp = await getServicePoliciesById(id);
      const data = resp.data;

      // Convert HTML content back to editor state
      let editorStateFromHtml = EditorState.createEmpty();
      if (data.raw_content) {
        const contentBlock = htmlToDraft(data.raw_content);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks, contentBlock.entityMap);
          editorStateFromHtml = EditorState.createWithContent(contentState);
        }
      }

      // Map category from API response
      const categoryValues = data.categories?.map((dt) => dt.id) || [];
      const selectedCategories = assignFormData.category_list.filter((opt) => categoryValues.includes(opt.value));
      console.log('selectedCategories', selectedCategories);

      setEditorState(editorStateFromHtml);

      // Generate HTML content from editor state to ensure sync
      const htmlContent = draftToHtml(convertToRaw(editorStateFromHtml.getCurrentContent()));

      assignFormData.title = data.title || data.name || '';
      assignFormData.content = htmlContent;
      assignFormData.category = selectedCategories;
      assignFormData.status = data.status === true || data.status === 'active' || data.status === 1;
      assignFormData.version = data.version || '';
    }

    setForm(assignFormData);
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
      is_form_touched: true
    }));
  };

  const handleStatusChange = (event) => {
    setForm((prevState) => ({
      ...prevState,
      status: event.target.checked,
      is_form_touched: true
    }));
  };

  const handleCategoryChange = (event, newValue) => {
    setForm((prevState) => ({
      ...prevState,
      category: newValue,
      is_form_touched: true
    }));
  };

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
    const htmlContent = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
    setForm((prevState) => ({
      ...prevState,
      content: htmlContent,
      is_form_touched: true
    }));
  };

  return (
    <>
      <PoliciesFormHeader form={form} formError={formError} />
      <MainCard content={true}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="policy-title" style={{ color: 'black' }}>
                {<FormattedMessage id="title" />} *
              </InputLabel>
              <TextField
                fullWidth
                id="title"
                name="title"
                className="form__input"
                value={form.title}
                onChange={handleChange}
                error={Boolean(formError.titleErr && formError.titleErr.length > 0)}
                helperText={formError.titleErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack spacing={1}>
              <InputLabel htmlFor="policy-version" style={{ color: 'black' }}>
                {<FormattedMessage id="version" />} *
              </InputLabel>
              <TextField
                fullWidth
                id="version"
                name="version"
                className="form__input"
                value={form.version}
                onChange={handleChange}
                error={Boolean(formError.versionErr && formError.versionErr.length > 0)}
                helperText={formError.versionErr || 'Format: x.x (e.g., 1.0)'}
                placeholder="1.0"
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack spacing={1}>
              <InputLabel htmlFor="policy-status" style={{ color: 'black' }}>
                {<FormattedMessage id="status" />}
              </InputLabel>
              <FormControlLabel
                control={<Switch checked={form.status} onChange={handleStatusChange} />}
                label={form.status ? 'Active' : 'Inactive'}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="policy-category" style={{ color: 'black' }}>
                {<FormattedMessage id="category" />}
              </InputLabel>
              <Autocomplete
                multiple
                id="category"
                options={form.category_list}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                value={form.category}
                onChange={handleCategoryChange}
                renderInput={(params) => <TextField {...params} placeholder="Select categories..." />}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="policy-content" style={{ color: 'black' }}>
                {<FormattedMessage id="content" />} *
              </InputLabel>
              <Editor
                editorState={editorState}
                wrapperClassName="demo-wrapper"
                editorClassName="demo-editor"
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                  options: [
                    'inline',
                    'blockType',
                    'fontSize',
                    'list',
                    'textAlign',
                    'link',
                    'embedded',
                    'emoji',
                    'image',
                    'remove',
                    'history'
                  ],
                  inline: { inDropdown: true },
                  list: { inDropdown: true },
                  textAlign: { inDropdown: true },
                  link: { inDropdown: true },
                  history: { inDropdown: true }
                }}
              />
              {formError.contentErr && <span style={{ color: '#f44336', fontSize: '0.75rem' }}>{formError.contentErr}</span>}
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default PoliciesForm;
